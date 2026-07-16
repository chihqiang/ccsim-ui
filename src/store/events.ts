import type { SdkEvents, SdkEventName } from '@/types/events'
import { logger } from '@/utils/logger'

type EventCallback<K extends SdkEventName> = SdkEvents[K]
type Cb = (...args: unknown[]) => void

export class EventBus {
  private events = new Map<string, Set<Cb>>()
  private maxListeners = 10

  setMaxListeners(n: number) {
    this.maxListeners = n
  }
  on<K extends SdkEventName>(event: K, cb: EventCallback<K>): void
  on(event: string, cb: Cb): void
  on(event: string, cb: Cb): void {
    if (!this.events.has(event)) this.events.set(event, new Set())
    const set = this.events.get(event)!
    if (set.size >= this.maxListeners) {
      logger.warn(`EventBus: 事件 "${event}" 已有 ${set.size} 个监听器，拒绝添加`)
      return
    }
    set.add(cb)
  }
  off<K extends SdkEventName>(event: K, cb: EventCallback<K>): void
  off(event: string, cb: Cb): void
  off(event: string, cb: Cb): void {
    this.events.get(event)?.delete(cb)
  }
  emit<K extends SdkEventName>(event: K, ...args: Parameters<EventCallback<K>>): void
  emit(event: string, ...args: unknown[]): void
  emit(event: string, ...args: unknown[]) {
    this.emitArray(event, args)
  }
  emitArray(event: string, args: unknown[]) {
    const listeners = this.events.get(event)
    if (!listeners) return
    for (const cb of [...listeners]) {
      try {
        cb.apply(null, args)
      } catch (err) {
        logger.error(`EventBus 回调异常 (event=${event}):`, err)
      }
    }
  }
  clear() {
    this.events.clear()
  }
}
