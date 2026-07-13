import type { HistoryBatch } from '@/visitor/types'
import type { HandlerContext, MessageHandler } from '@/visitor/handlers/context'
import { store } from '@/visitor/store/store'
import { isMsgIdSeen, registerSeenMsgId } from '@/core/utils/dedup'
import { toChatMessageItem } from '@/core/utils/messageBuilder'
import { ensureSortByCreatedAt } from '@/core/messaging/pipeline'

export class HistoryBatchHandler implements MessageHandler<HistoryBatch> {
  readonly type = 'history_batch'
  handle(msg: HistoryBatch, _ctx: HandlerContext): void {
    if (!msg.data || !msg.data.length) {
      store._hasMoreHistory = false
      store.historyLoading = false
      return
    }

    const incoming: ReturnType<typeof toChatMessageItem>[] = []

    for (const raw of msg.data) {
      if (raw.msg_id > 0 && isMsgIdSeen(raw.msg_id)) continue
      if (raw.msg_id > 0) registerSeenMsgId(raw.msg_id)
      incoming.push(toChatMessageItem(raw, { isRead: true }))
    }

    if (!incoming.length) {
      store._hasMoreHistory = false
      store.historyLoading = false
      return
    }

    store.messages.unshift(...incoming)
    ensureSortByCreatedAt(store.messages)

    store._hasMoreHistory = incoming.length >= (msg.count ?? 20)
    store.historyLoading = false
  }
}
