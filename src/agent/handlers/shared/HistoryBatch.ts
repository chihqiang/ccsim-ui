/**
 * HistoryBatch 消息处理器
 *
 * 接收历史消息批量数据：
 * 1. 对每条消息做 msgId 去重
 * 2. 使用 toChatMessageItem() 统一构建
 * 3. 前插到 messagesMap[session_id]
 * 4. 按 createdAt 排序保证顺序正确
 */
import type { HistoryBatch } from '@/agent/types'
import type { HandlerContext, MessageHandler } from '@/agent/handlers/context'
import { store } from '@/agent/store/store'
import { isMsgIdSeen, registerSeenMsgId } from '@/core/utils/dedup'
import { toChatMessageItem } from '@/core/utils/messageBuilder'
import { logger } from '@/core/utils/logger'
import { MAX_MESSAGES_PER_CONVERSATION } from '@/core/utils/constants'

export class HistoryBatchHandler implements MessageHandler<HistoryBatch> {
  readonly type = 'history_batch'

  handle(msg: HistoryBatch, _ctx: HandlerContext): void {
    const sid = msg.session_id

    if (!msg.data || !msg.data.length) {
      logger.debug('HistoryBatch: empty batch for session', sid)
      store._hasMoreHistory[sid] = false
      store.historyLoading[sid] = false
      return
    }

    const incoming: ReturnType<typeof toChatMessageItem>[] = []

    for (const item of msg.data) {
      // msgId 去重
      if (item.msg_id > 0 && isMsgIdSeen(item.msg_id)) continue
      if (item.msg_id > 0) registerSeenMsgId(item.msg_id)

      incoming.push(toChatMessageItem(item, { isRead: true }))
    }

    if (!incoming.length) {
      logger.debug('HistoryBatch: all messages deduplicated for session', sid)
      store._hasMoreHistory[sid] = false
      store.historyLoading[sid] = false
      return
    }

    // 确保 messagesMap 中有该会话的数组
    if (!store.messagesMap[sid]) {
      store.messagesMap[sid] = []
    }

    // 前插历史消息（使用 splice 避免大数组展开导致栈溢出）
    store.messagesMap[sid].splice(0, 0, ...incoming)

    // 按 createdAt 排序，保证前插后顺序正确
    store.messagesMap[sid].sort((a, b) => a.createdAt - b.createdAt)

    // 超出上限时裁剪旧消息
    if (store.messagesMap[sid].length > MAX_MESSAGES_PER_CONVERSATION) {
      store.messagesMap[sid].splice(0, store.messagesMap[sid].length - MAX_MESSAGES_PER_CONVERSATION)
    }

    store._hasMoreHistory[sid] = incoming.length >= (msg.count ?? 20)
    store.historyLoading[sid] = false

    logger.debug('HistoryBatch: prepended', incoming.length, 'messages to session', sid)
  }
}
