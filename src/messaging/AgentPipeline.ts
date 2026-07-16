/**
 * 消息管道 — Agent 模式
 *
 * 负责：
 * 1. ACK 匹配与状态更新（同步写入 messagesMap）
 * 2. Push 消息 3 层回退匹配
 * 3. 超时标记失败
 * 4. 写入接收到的消息到 messagesMap[sessionId]
 *
 * Agent 特点：乐观消息在独立的 optimisticMessages 中，
 * 确认后同步写入 messagesMap 以保持 UI 可见。
 */
import type { ChatMessageItem } from '@/types/store'
import { MessageStatusEnum } from '@/types/store'
import { MAX_MESSAGES_PER_CONVERSATION } from '@/types/sdk'
import {
  OptimisticQueue, someByMsgId, ensureSortByCreatedAt,
  findIndexByTempId, findIndexByMsgIdPending, findIndexByPendingContent,
} from '@/messaging/corePipeline'

export class MessagePipeline {
  queue = new OptimisticQueue()

  resolveByAck(
    tempId: string, msgId: number, sessionId: number,
    seqNum: number, createdAt: number,
    messages: ChatMessageItem[],
    optimisticMessages: ChatMessageItem[],
    messagesMap: Record<number, ChatMessageItem[]>,
  ): boolean {
    let item: ChatMessageItem | undefined
    let foundInOptimistic = false

    const ai = findIndexByTempId(optimisticMessages, tempId)
    if (ai !== -1) {
      item = optimisticMessages[ai]
      foundInOptimistic = true
    } else {
      const mi = findIndexByTempId(messages, tempId)
      if (mi !== -1) item = messages[mi]
    }

    if (item) {
      item.msgId = msgId
      item.sessionId = sessionId
      item.seqNum = seqNum
      item.createdAt = createdAt
      item.status = MessageStatusEnum.DELIVERED
    }

    this.queue.removeByTempId(tempId)

    // Agent 模式：同步写入 messagesMap
    if (item && foundInOptimistic && messagesMap) {
      if (!messagesMap[sessionId]) messagesMap[sessionId] = []
      if (!someByMsgId(messagesMap[sessionId], msgId)) {
        messagesMap[sessionId].push(item)
      }
    }

    return item !== undefined
  }

  resolveByPush(
    msgId: number, sessionId: number, seqNum: number, createdAt: number,
    messages: ChatMessageItem[],
    optimisticMessages: ChatMessageItem[],
    messagesMap: Record<number, ChatMessageItem[]>,
    content?: string, senderId?: number,
  ): ChatMessageItem | undefined {
    let item: ChatMessageItem | undefined
    let foundInOptimistic = false

    // Layer 1: msgId + PENDING
    const pmi = findIndexByMsgIdPending(messages, msgId)
    if (pmi !== -1) {
      item = messages[pmi]
      item.msgId = msgId; item.seqNum = seqNum; item.createdAt = createdAt
      item.status = MessageStatusEnum.DELIVERED
      this.queue.removeByTempId(item.tempId)
    } else {
      const poi = findIndexByMsgIdPending(optimisticMessages, msgId)
      if (poi !== -1) {
        item = optimisticMessages[poi]
        foundInOptimistic = true
        item.msgId = msgId; item.seqNum = seqNum; item.createdAt = createdAt
        item.status = MessageStatusEnum.DELIVERED
        this.queue.removeByTempId(item.tempId)
      }
    }

    // Layer 2: sessionId + senderId + content
    if (!item && content != null && senderId != null) {
      const cmi = findIndexByPendingContent(messages, sessionId, senderId, content)
      if (cmi !== -1) {
        item = messages[cmi]
        item.msgId = msgId; item.seqNum = seqNum; item.createdAt = createdAt
        item.status = MessageStatusEnum.DELIVERED
        this.queue.removeByTempId(item.tempId)
      } else {
        const coi = findIndexByPendingContent(optimisticMessages, sessionId, senderId, content)
        if (coi !== -1) {
          item = optimisticMessages[coi]
          foundInOptimistic = true
          item.msgId = msgId; item.seqNum = seqNum; item.createdAt = createdAt
          item.status = MessageStatusEnum.DELIVERED
          this.queue.removeByTempId(item.tempId)
        }
      }
    }

    // Agent 模式：同步写入 messagesMap
    if (item && foundInOptimistic) {
      if (!messagesMap[sessionId]) messagesMap[sessionId] = []
      if (!someByMsgId(messagesMap[sessionId], msgId)) {
        messagesMap[sessionId].push(item)
      }
    }

    return item || undefined
  }

  markFailed(
    tempId: string,
    messages: ChatMessageItem[] | undefined,
    optimisticMessages: ChatMessageItem[],
  ) {
    const item = this.queue.removeByTempId(tempId)
    if (!item) return

    if (messages) {
      const mi = findIndexByTempId(messages, tempId)
      if (mi !== -1) { messages[mi].status = MessageStatusEnum.FAILED; return }
    }
    const oi = findIndexByTempId(optimisticMessages, tempId)
    if (oi !== -1) optimisticMessages[oi].status = MessageStatusEnum.FAILED
  }

  writeIncoming(
    msg: ChatMessageItem,
    _messages: ChatMessageItem[],
    optimisticMessages: ChatMessageItem[],
    messagesMap: Record<number, ChatMessageItem[]>,
    currentSessionId?: number | null,
  ) {
    const sid = msg.sessionId
    if (!messagesMap[sid]) messagesMap[sid] = []
    messagesMap[sid].push(msg)

    if (messagesMap[sid].length > MAX_MESSAGES_PER_CONVERSATION) {
      messagesMap[sid].splice(0, messagesMap[sid].length - MAX_MESSAGES_PER_CONVERSATION)
    }
    ensureSortByCreatedAt(messagesMap[sid])

    if (currentSessionId === sid && msg.status === MessageStatusEnum.PENDING) {
      optimisticMessages.push(msg)
      if (optimisticMessages.length > MAX_MESSAGES_PER_CONVERSATION) {
        optimisticMessages.splice(0, optimisticMessages.length - MAX_MESSAGES_PER_CONVERSATION)
      }
    }
  }
}
