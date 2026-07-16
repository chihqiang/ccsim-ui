import type { OfflinePush, OfflineMessageItem } from '@/types'
import type { HandlerContext, MessageHandler } from '@/handlers/agentContext'
import { store } from '@/store/agent'
import { isMsgIdSeen, registerSeenMsgId } from '@/utils/dedup'
import { MessageStatusEnum } from '@/types/store'
import type { ChatMessageItem } from '@/types/store'
import { toChatMessageItem } from '@/utils/messageBuilder'
import { MAX_MESSAGES_PER_CONVERSATION } from '@/types/sdk'
import { cancelOptimisticTimer } from '@/messaging/coreSend'
import { findIndexByMsgIdPending, findIndexByPendingContent } from '@/messaging/corePipeline'

export class AgentOfflinePushHandler implements MessageHandler<OfflinePush> {
  readonly type = 'offline_push'
  handle(msg: OfflinePush, ctx: HandlerContext): void {
    if (!msg.messages) return
    for (const item of msg.messages) {
      if (item.msg_id > 0 && isMsgIdSeen(item.msg_id)) continue
      if (item.msg_id > 0) registerSeenMsgId(item.msg_id)

      if (!store.messagesMap[item.session_id]) store.messagesMap[item.session_id] = []
      const msgs = store.messagesMap[item.session_id]

      // 尝试匹配乐观消息（3 层回退）
      const matched = resolveOfflineOptimistic(item, msgs, ctx)
      if (matched) continue

      msgs.push(toChatMessageItem(item, { isRead: true, status: MessageStatusEnum.DELIVERED }))
      if (msgs.length > MAX_MESSAGES_PER_CONVERSATION) {
        msgs.splice(0, msgs.length - MAX_MESSAGES_PER_CONVERSATION)
      }
    }
  }
}

/** 在离线消息中查找匹配的乐观消息并更新 */
function resolveOfflineOptimistic(
  item: OfflineMessageItem,
  msgs: ChatMessageItem[],
  ctx: HandlerContext,
): boolean {
  const { msg_id, session_id, seq_num, created_at, content, sender_id } = item
  if (content == null || sender_id == null) return false

  // Layer 1: 按 msgId + PENDING
  const l1 = findIndexByMsgIdPending(msgs, msg_id)
  if (l1 !== -1) {
    const m = msgs[l1]
    m.msgId = msg_id; m.seqNum = seq_num; m.createdAt = created_at
    m.status = MessageStatusEnum.DELIVERED
    if (m.tempId) cancelOptimisticTimer(ctx.sendState, m.tempId)
    return true
  }

  // Layer 2: 按 sessionId + senderId + content + PENDING
  const l2 = findIndexByPendingContent(msgs, session_id, sender_id, content)
  if (l2 !== -1) {
    const m = msgs[l2]
    m.msgId = msg_id; m.seqNum = seq_num; m.createdAt = created_at
    m.status = MessageStatusEnum.DELIVERED
    if (m.tempId) cancelOptimisticTimer(ctx.sendState, m.tempId)
    return true
  }

  return false
}
