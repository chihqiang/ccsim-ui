import type { OfflinePush } from '@/visitor/types'
import type { HandlerContext, MessageHandler } from '@/visitor/handlers/context'
import { store } from '@/visitor/store/store'
import { isMsgIdSeen, registerSeenMsgId } from '@/core/utils/dedup'
import { cancelOptimisticTimer } from '@/visitor/messaging/send'
import { toChatMessageItem } from '@/core/utils/messageBuilder'
import { MAX_MESSAGES_PER_CONVERSATION } from '@/core/utils/constants'

export class OfflinePushHandler implements MessageHandler<OfflinePush> {
  readonly type = 'offline_push'
  handle(msg: OfflinePush, ctx: HandlerContext): void {
    if (!msg.messages) return
    for (const item of msg.messages) {
      if (item.msg_id > 0 && isMsgIdSeen(item.msg_id)) continue
      if (item.msg_id > 0) registerSeenMsgId(item.msg_id)

      const matched = ctx.pipeline.resolveByPush(
        item.msg_id, item.session_id, item.seq_num, item.created_at,
        store.messages, item.content, item.sender_id,
      )
      if (matched) {
        cancelOptimisticTimer(ctx._sendState, matched.tempId)
        continue
      }

      store.messages.push(toChatMessageItem(item, { isRead: item.sender_role === 'agent' }))
    }
    if (store.messages.length > MAX_MESSAGES_PER_CONVERSATION) {
      store.messages.splice(0, store.messages.length - MAX_MESSAGES_PER_CONVERSATION)
    }
  }
}
