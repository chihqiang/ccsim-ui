import type { ServerMessage } from '@/types'
import { logger } from '@/utils/logger'
import { v4 as uuidv4 } from 'uuid'
import {
  HEARTBEAT_INTERVAL,
  MAX_RECONNECT_ATTEMPTS,
  RECONNECT_BASE_DELAY,
  MAX_RECONNECT_DELAY,
  CONNECTION_TIMEOUT,
} from '@/types/sdk'
import { t } from '@/i18n'

export type ServerMsgHandler = (msg: ServerMessage) => void
export type ParseErrorHandler = (rawData: string) => void

export type UrlProvider = string | (() => string)

export interface WsClientOptions {
  url: UrlProvider
  maxReconnectAttempts?: number
  maxReconnectDelay?: number
}

/** 心跳 ACK 超时阈值：连续 2 次心跳间隔内未收到 ACK 则判定连接假死 */
const HEARTBEAT_ACK_TIMEOUT = HEARTBEAT_INTERVAL * 2.5

function resolveUrl(u: UrlProvider): string {
  return typeof u === 'function' ? u() : u
}

export class WsClient {
  readonly traceId: string
  private ws: WebSocket | null = null
  private urlProvider: UrlProvider
  private onMsgCb: ServerMsgHandler | null = null
  private onOpenCb: (() => void) | null = null
  private onCloseCb: ((code: number, reason: string) => void) | null = null
  private onErrorCb: ((error: Event) => void) | null = null
  private onReconnectingCb: ((attempt: number, maxAttempts: number) => void) | null = null
  private onParseErrorCb: ParseErrorHandler | null = null
  private reconnectAttempts = 0
  private reconnectDelay = RECONNECT_BASE_DELAY
  private maxReconnectAttempts = MAX_RECONNECT_ATTEMPTS
  private maxReconnectDelay = MAX_RECONNECT_DELAY
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private connectTimer: ReturnType<typeof setTimeout> | null = null
  private destroyed = false
  private pendingQueue: string[] = []
  private static readonly MAX_PENDING = 100

  /** 上次收到 heartbeat_ack 的时间戳，用于检测连接假死 */
  lastHeartbeatAckTs = 0

  private onConnectTimeout = () => {
    logger.warn(`[traceId=${this.traceId}] WebSocket 连接超时 (${CONNECTION_TIMEOUT}ms):`, this.url)
    if (this.ws) {
      this.ws.onopen = null
      this.ws.onclose = null
      this.ws.onerror = null
      this.ws.close()
      this.ws = null
    }
    this.onCloseCb?.(0, t('connection.disconnected'))
    this.attemptReconnect()
  }

  private onWsOpen = () => {
    this.clearConnectTimer()
    if (this.destroyed) {
      logger.debug(`[traceId=${this.traceId}] WebSocket onopen 时已 destroyed`)
      this.ws?.close()
      this.ws = null
      return
    }
    this.reconnectAttempts = 0
    this.lastHeartbeatAckTs = Date.now()
    this.startHeartbeat()
    this.onOpenCb?.()
    this.flushPending()
  }

  private onWsMessage = (e: MessageEvent) => {
    try {
      const raw = typeof e.data === 'string' ? e.data : String(e.data)
      logger.debug(`[traceId=${this.traceId}] <<< ${raw}`)
      this.onMsgCb?.(JSON.parse(raw))
    } catch {
      const raw = typeof e.data === 'string' ? e.data : String(e.data)
      logger.warn(`[traceId=${this.traceId}] WebSocket 消息解析失败:`, raw)
      this.onParseErrorCb?.(raw)
    }
  }

  private onWsClose = (e: CloseEvent) => {
    this.clearConnectTimer()
    this.stopHeartbeat()
    this.onCloseCb?.(e.code, e.reason)
    if (e.code !== 1000) this.attemptReconnect()
  }

  private onWsError = (e: Event) => {
    logger.error(`[traceId=${this.traceId}] WebSocket 连接错误, url=${this.url}`)
    this.onErrorCb?.(e)
  }

  constructor(url: UrlProvider | WsClientOptions) {
    if (typeof url === 'object' && url !== null) {
      this.urlProvider = url.url
      if (url.maxReconnectAttempts != null) this.maxReconnectAttempts = url.maxReconnectAttempts
      if (url.maxReconnectDelay != null) this.maxReconnectDelay = url.maxReconnectDelay
    } else {
      this.urlProvider = url
    }
    this.traceId = uuidv4()
  }

  private get url(): string {
    return resolveUrl(this.urlProvider)
  }

  connect() {
    if (this.destroyed) return
    this.clearConnectTimer()
    const u = this.url
    logger.info(`[traceId=${this.traceId}] WebSocket 连接: ${u}`)
    try {
      this.ws = new WebSocket(u)
      this.ws.binaryType = 'arraybuffer'
      this.connectTimer = setTimeout(this.onConnectTimeout, CONNECTION_TIMEOUT)
      this.ws.onopen = this.onWsOpen
      this.ws.onmessage = this.onWsMessage
      this.ws.onclose = this.onWsClose
      this.ws.onerror = this.onWsError
    } catch (err) {
      this.clearConnectTimer()
      logger.error(`[traceId=${this.traceId}] WebSocket 创建失败:`, err)
      this.onErrorCb?.(new Event('error'))
      this.attemptReconnect()
    }
  }

  disconnect() {
    this.destroyed = true
    this.clearConnectTimer()
    this.stopHeartbeat()
    this.cancelReconnect()
    this.reconnectAttempts = 0
    this.pendingQueue = []
    // 如果 WS 已关闭，close() 是 no-op，onWsClose 不会触发
    const wasAlreadyClosed = !this.ws || this.ws.readyState === WebSocket.CLOSED
    this.ws?.close()
    this.ws = null
    if (wasAlreadyClosed) {
      this.onCloseCb?.(1000, 'disconnect')
    }
  }

  send(msg: unknown): boolean {
    const enriched = { ...(msg as object), trace_id: this.traceId }
    const data = JSON.stringify(enriched)
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(data)
        return true
      } catch {
        return false
      }
    } else if (this.ws?.readyState === WebSocket.CONNECTING) {
      if (this.pendingQueue.length >= WsClient.MAX_PENDING) {
        logger.warn(`[traceId=${this.traceId}] 待发送队列已满(${WsClient.MAX_PENDING})，消息被丢弃`)
        return false
      }
      this.pendingQueue.push(data)
      return true
    }
    return false
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
  onMessage(cb: ServerMsgHandler) {
    this.onMsgCb = cb
  }
  onOpen(cb: () => void) {
    this.onOpenCb = cb
  }
  onClose(cb: (code: number, reason: string) => void) {
    this.onCloseCb = cb
  }
  onError(cb: (error: Event) => void) {
    this.onErrorCb = cb
  }
  onReconnecting(cb: (attempt: number, maxAttempts: number) => void) {
    this.onReconnectingCb = cb
  }
  onParseError(cb: ParseErrorHandler) {
    this.onParseErrorCb = cb
  }

  private flushPending() {
    while (this.pendingQueue.length > 0) {
      const data = this.pendingQueue.shift()!
      try {
        this.ws?.send(data)
      } catch {
        this.pendingQueue.unshift(data)
        return
      }
    }
  }

  private clearConnectTimer() {
    if (this.connectTimer) {
      clearTimeout(this.connectTimer)
      this.connectTimer = null
    }
  }

  /** A1/S1: 心跳超时检测 — 如果超过阈值未收到 ACK，判定连接假死并强制重连 */
  private sendHeartbeat() {
    if (this.ws?.readyState !== WebSocket.OPEN) return
    if (
      this.lastHeartbeatAckTs > 0 &&
      Date.now() - this.lastHeartbeatAckTs > HEARTBEAT_ACK_TIMEOUT
    ) {
      logger.warn(
        `[traceId=${this.traceId}] 心跳 ACK 超时 (${Date.now() - this.lastHeartbeatAckTs}ms)，强制重连`,
      )
      if (this.ws) {
        this.ws.onopen = null
        this.ws.onclose = null
        this.ws.onerror = null
        this.ws.onmessage = null
        this.ws.close()
        this.ws = null
      }
      this.stopHeartbeat()
      this.onCloseCb?.(0, t('connection.error'))
      this.attemptReconnect()
      return
    }
    this.send({ type: 'heartbeat' })
  }
  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), HEARTBEAT_INTERVAL)
  }
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private onReconnectTimer = () => {
    this.reconnectTimer = null
    logger.info(`[traceId=${this.traceId}] 重连第 ${this.reconnectAttempts} 次, url=${this.url}`)
    this.connect()
  }

  private attemptReconnect() {
    if (this.destroyed || this.reconnectAttempts >= this.maxReconnectAttempts) return
    this.reconnectAttempts++
    const delay = Math.round(
      Math.min(
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
        this.maxReconnectDelay,
      ) *
        (0.75 + Math.random() * 0.5),
    )
    logger.info(
      `[traceId=${this.traceId}] ${delay}ms 后重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    )
    this.onReconnectingCb?.(this.reconnectAttempts, this.maxReconnectAttempts)
    this.reconnectTimer = setTimeout(this.onReconnectTimer, delay)
  }

  private cancelReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}
