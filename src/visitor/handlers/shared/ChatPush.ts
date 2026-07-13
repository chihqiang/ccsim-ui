import type { ChatPush } from '@/visitor/types'
import type { HandlerContext, MessageHandler } from '@/visitor/handlers/context'
import { store } from '@/visitor/store/store'
import { isMsgIdSeen, registerSeenMsgId } from '@/core/utils/dedup'
import { cancelOptimisticTimer } from '@/visitor/messaging/send'
import { toChatMessageItem } from '@/core/utils/messageBuilder'

export class ChatPushHandler implements MessageHandler<ChatPush> {
  readonly type = 'chat_push'
  handle(msg: ChatPush, ctx: HandlerContext): void {
    // Dedup: skip if we've already seen this msg_id
    if (msg.msg_id > 0 && isMsgIdSeen(msg.msg_id)) return
    if (msg.msg_id > 0) registerSeenMsgId(msg.msg_id)

    // Try to resolve an existing optimistic message (3-layer fallback)
    const resolved = ctx.pipeline.resolveByPush(
      msg.msg_id,
      msg.session_id,
      msg.seq_num,
      msg.created_at,
      store.messages,
      msg.content,
      msg.sender_id,
    )

    if (resolved) {
      // Optimistic message was matched — cancel its timeout timer
      cancelOptimisticTimer(ctx._sendState, resolved.tempId)
      return
    }

    // No optimistic match — this is a new incoming message (e.g. from agent)
    const item = toChatMessageItem(
      {
        msg_id: msg.msg_id,
        session_id: msg.session_id,
        sender_role: msg.sender_role,
        sender_id: msg.sender_id,
        nickname: msg.nickname,
        content: msg.content,
        msg_type: msg.msg_type,
        seq_num: msg.seq_num,
        created_at: msg.created_at,
      },
      { isRead: msg.sender_role === 'agent' },
    )

    ctx.pipeline.writeIncoming(item, store.messages)

    // 未读计数：面板隐藏时来自坐席的消息计入未读
    if (!store.panelVisible && msg.sender_role === 'agent') {
      store.unreadCount++
    }
  }
}
