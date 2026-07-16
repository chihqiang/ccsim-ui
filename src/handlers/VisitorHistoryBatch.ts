import type { HistoryBatch } from '@/types'
import type { HandlerContext, MessageHandler } from '@/handlers/visitorContext'
import { store } from '@/store/visitor'
import { isMsgIdSeen, registerSeenMsgId } from '@/utils/dedup'
import { toChatMessageItem } from '@/utils/messageBuilder'
import { ensureSortByCreatedAt } from '@/messaging/corePipeline'

export class VisitorHistoryBatchHandler implements MessageHandler<HistoryBatch> {
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
