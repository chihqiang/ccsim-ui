/**
 * 消息管道 — 共享核心
 *
 * 提供 OptimisticQueue 和查找辅助函数，两个角色共用。
 * MessagePipeline 在各角色目录中定义（store 结构不同）。
 */
import type { ChatMessageItem } from '@/types/store'
import { MessageStatusEnum } from '@/types/store'

/** Helper: for 循环替代 .findIndex 避免闭包分配 */
export function findIndexByTempId(arr: ChatMessageItem[], tempId: string): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].tempId === tempId) return i
  }
  return -1
}

export function findIndexByMsgIdPending(arr: ChatMessageItem[], msgId: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].msgId === msgId && arr[i].status === MessageStatusEnum.PENDING) return i
  }
  return -1
}

export function findIndexByPendingContent(
  arr: ChatMessageItem[],
  sessionId: number,
  senderId: number,
  content: string,
): number {
  for (let i = 0; i < arr.length; i++) {
    const m = arr[i]
    if (m.status === MessageStatusEnum.PENDING && m.sessionId === sessionId && m.senderId === senderId && m.content === content) {
      return i
    }
  }
  return -1
}

export function someByMsgId(arr: ChatMessageItem[], msgId: number): boolean {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].msgId === msgId) return true
  }
  return false
}

/** 尾窗口检查并按 createdAt 排序，避免极端乱序 */
export function ensureSortByCreatedAt(arr: ChatMessageItem[]) {
  if (arr.length < 2) return
  const windowSize = Math.min(arr.length, 5)
  for (let i = arr.length - 1; i >= arr.length - windowSize + 1 && i >= 1; i--) {
    if (arr[i].createdAt < arr[i - 1].createdAt) {
      arr.sort((a, b) => a.createdAt - b.createdAt)
      return
    }
  }
}

/** 乐观消息队列 */
export class OptimisticQueue {
  private items: ChatMessageItem[] = []

  push(item: ChatMessageItem) { this.items.push(item) }

  findByTempId(tempId: string): ChatMessageItem | undefined {
    const idx = findIndexByTempId(this.items, tempId)
    return idx !== -1 ? this.items[idx] : undefined
  }

  removeByTempId(tempId: string): ChatMessageItem | undefined {
    const idx = findIndexByTempId(this.items, tempId)
    if (idx === -1) return undefined
    const [item] = this.items.splice(idx, 1)
    return item
  }

  removeBySessionId(sessionId: number) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (this.items[i].sessionId === sessionId) this.items.splice(i, 1)
    }
  }

  clear() { this.items.length = 0 }
  get length() { return this.items.length }
}
