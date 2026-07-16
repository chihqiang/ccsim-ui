import type { ChatPush } from '@/types'
import type { HandlerContext, MessageHandler } from '@/handlers/visitorContext'
import { store } from '@/store/visitor'
import { isMsgIdSeen, registerSeenMsgId } from '@/utils/dedup'
import { cancelOptimisticTimer } from '@/messaging/coreSend'
import { toChatMessageItem } from '@/utils/messageBuilder'
import { Role } from '@/types/sdk'

export class VisitorChatPushHandler implements MessageHandler<ChatPush> {
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
      cancelOptimisticTimer(ctx.sendState, resolved.tempId)
      return
    }

    // No optimistic match — this is a new incoming message (e.g. from agent)
    const item = toChatMessageItem(msg, { isRead: msg.sender_role === Role.AGENT })

    ctx.pipeline.writeIncoming(item, store.messages)

    // 未读计数：面板隐藏时来自坐席的消息计入未读
    if (!store.panelVisible && msg.sender_role === Role.AGENT) {
      store.unreadCount++
    }
  }
}
