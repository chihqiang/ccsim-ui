/**
 * ChatPush 消息处理器
 *
 * 处理流程：
 * 1. msgId 去重检查
 * 2. 尝试 resolveByPush 匹配乐观消息（3 层回退）
 * 3. 若匹配成功，取消超时计时器并返回
 * 4. 若未匹配，构建 ChatMessageItem 并写入 messagesMap
 * 5. 更新会话列表的 lastMsgContent / lastMsgTime / unreadCount
 */
import type { ChatPush } from '@/types'
import type { HandlerContext, MessageHandler } from '@/handlers/agentContext'
import { store } from '@/store/agent'
import { isMsgIdSeen, registerSeenMsgId } from '@/utils/dedup'
import { cancelOptimisticTimer } from '@/messaging/coreSend'
import { toChatMessageItem } from '@/utils/messageBuilder'
import { logger } from '@/utils/logger'
import { Role } from '@/types/sdk'

export class AgentChatPushHandler implements MessageHandler<ChatPush> {
  readonly type = 'chat_push'

  handle(msg: ChatPush, ctx: HandlerContext): void {
    // 1. msgId 去重
    if (msg.msg_id > 0 && isMsgIdSeen(msg.msg_id)) {
      logger.debug('ChatPush: duplicate msgId skipped', msg.msg_id)
      return
    }
    if (msg.msg_id > 0) {
      registerSeenMsgId(msg.msg_id)
    }

    const sid = msg.session_id
    const currentMessages = store.messagesMap[sid] || []

    // 2. 尝试 resolveByPush 匹配乐观消息
    const resolved = ctx.pipeline.resolveByPush(
      msg.msg_id,
      sid,
      msg.seq_num,
      msg.created_at,
      currentMessages,
      store.optimisticMessages,
      store.messagesMap,
      msg.content,
      msg.sender_id,
    )

    if (resolved) {
      // 3. 匹配成功：取消超时计时器
      logger.debug('ChatPush: resolved optimistic message', msg.msg_id)
      cancelOptimisticTimer(ctx.sendState, resolved.tempId)
      updateSessionMeta(sid, msg.content, msg.created_at, msg.sender_role, ctx)
      return
    }

    // 4. 未匹配：构建新消息并写入 store
    const item = toChatMessageItem(msg, { isRead: sid === store.currentSessionId })
    ctx.pipeline.writeIncoming(
      item,
      currentMessages,
      store.optimisticMessages,
      store.messagesMap,
      store.currentSessionId,
    )

    logger.debug('ChatPush: wrote incoming message', msg.msg_id, 'to session', sid)

    // 5. 更新会话元数据
    updateSessionMeta(sid, msg.content, msg.created_at, msg.sender_role, ctx)
  }
}

/**
 * 更新会话列表中对应 session 的 lastMsgContent / lastMsgTime / unreadCount
 */
function updateSessionMeta(
  sessionId: number,
  content: string,
  createdAt: number,
  senderRole: string,
  _ctx: HandlerContext,
) {
  const session = store.sessions.find(s => s.sessionId === sessionId)
  if (!session) return

  session.lastMsgContent = content
  session.lastMsgTime = createdAt

  // visitor 发送的消息且不是当前选中的会话 → 增加未读计数
  if (senderRole === Role.VISITOR && sessionId !== store.currentSessionId) {
    session.unreadCount++
    store.unreadCount++
  }
}
