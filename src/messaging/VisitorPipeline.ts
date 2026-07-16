/**
 * 消息管道 — Visitor 模式
 *
 * 管理乐观消息的生命周期：
 * - resolveByAck: 收到 chat_ack 后匹配 tempId
 * - resolveByPush: 收到 chat_push 后 3 层回退匹配
 * - markFailed: 超时标记失败
 * - writeIncoming: 写入非乐观的推送消息
 *
 * Visitor 使用扁平 messages[] 数组，乐观消息与已确认消息共存。
 */
import type { ChatMessageItem } from '@/types/store'
import { MessageStatusEnum } from '@/types/store'
import { MAX_MESSAGES_PER_CONVERSATION } from '@/types/sdk'
import {
  OptimisticQueue,
  findIndexByTempId,
  findIndexByMsgIdPending,
  findIndexByPendingContent,
  ensureSortByCreatedAt,
} from '@/messaging/corePipeline'

export class MessagePipeline {
  queue = new OptimisticQueue()

  resolveByAck(
    tempId: string, msgId: number, sessionId: number,
    seqNum: number, createdAt: number, messages: ChatMessageItem[],
  ): boolean {
    const idx = findIndexByTempId(messages, tempId)
    if (idx !== -1) {
      const item = messages[idx]
      item.msgId = msgId; item.sessionId = sessionId
      item.seqNum = seqNum; item.createdAt = createdAt
      item.status = MessageStatusEnum.DELIVERED
    }
    this.queue.removeByTempId(tempId)
    return idx !== -1
  }

  resolveByPush(
    msgId: number, sessionId: number, seqNum: number, createdAt: number,
    messages: ChatMessageItem[], content?: string, senderId?: number,
  ): ChatMessageItem | undefined {
    const pvi = findIndexByMsgIdPending(messages, msgId)
    if (pvi !== -1) {
      const item = messages[pvi]
      item.msgId = msgId; item.seqNum = seqNum; item.createdAt = createdAt
      item.status = MessageStatusEnum.DELIVERED
      this.queue.removeByTempId(item.tempId)
      return item
    }
    if (content != null && senderId != null) {
      const cvi = findIndexByPendingContent(messages, sessionId, senderId, content)
      if (cvi !== -1) {
        const item = messages[cvi]
        item.msgId = msgId; item.seqNum = seqNum; item.createdAt = createdAt
        item.status = MessageStatusEnum.DELIVERED
        this.queue.removeByTempId(item.tempId)
        return item
      }
    }
    return undefined
  }

  markFailed(tempId: string, messages: ChatMessageItem[]) {
    const item = this.queue.removeByTempId(tempId)
    if (!item) return
    const idx = findIndexByTempId(messages, tempId)
    if (idx !== -1) messages[idx].status = MessageStatusEnum.FAILED
  }

  writeIncoming(msg: ChatMessageItem, messages: ChatMessageItem[]) {
    messages.push(msg)
    if (messages.length > MAX_MESSAGES_PER_CONVERSATION) {
      messages.splice(0, messages.length - MAX_MESSAGES_PER_CONVERSATION)
    }
    ensureSortByCreatedAt(messages)
  }
}
