import type { OfflinePush } from '@/types'
import type { HandlerContext, MessageHandler } from '@/handlers/visitorContext'
import { store } from '@/store/visitor'
import { isMsgIdSeen, registerSeenMsgId } from '@/utils/dedup'
import { cancelOptimisticTimer } from '@/messaging/coreSend'
import { toChatMessageItem } from '@/utils/messageBuilder'
import { MAX_MESSAGES_PER_CONVERSATION } from '@/types/sdk'
import { Role } from '@/types/sdk'

export class VisitorOfflinePushHandler implements MessageHandler<OfflinePush> {
  readonly type = 'offline_push'
  handle(msg: OfflinePush, ctx: HandlerContext): void {
    if (!msg.messages) return
    for (const item of msg.messages) {
      if (item.msg_id > 0 && isMsgIdSeen(item.msg_id)) continue
      if (item.msg_id > 0) registerSeenMsgId(item.msg_id)

      const matched = ctx.pipeline.resolveByPush(
        item.msg_id,
        item.session_id,
        item.seq_num,
        item.created_at,
        store.messages,
        item.content,
        item.sender_id,
      )
      if (matched) {
        cancelOptimisticTimer(ctx.sendState, matched.tempId)
        continue
      }

      store.messages.push(toChatMessageItem(item, { isRead: item.sender_role === Role.AGENT }))
    }
    if (store.messages.length > MAX_MESSAGES_PER_CONVERSATION) {
      store.messages.splice(0, store.messages.length - MAX_MESSAGES_PER_CONVERSATION)
    }
  }
}
