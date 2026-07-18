/**
 * SDK 基类 — 封装两个角色共有的连接管理、事件分发、消息处理
 */
import type { ServerMessage } from '@/types/serverMessage'
import { EventBus } from '@/store/events'
import { WsClient, type UrlProvider } from '@/connection'
import { logger } from '@/utils/logger'
import { LogLevel } from '@/utils/logger'
import { CcsimError, toCcsimError } from '@/utils/errors'
import { logVersion } from '@/utils/version'
import { clearAllTimers } from '@/messaging/coreSend'
import { t } from '@/i18n'
import { AUTH_TIMEOUT } from '@/types/sdk'
import type { RightPanelSidebar } from '@/types/sidebar'
import { DEFAULT_MODULE_ORDER } from '@/types/sidebar'
import type { ToolbarItem } from '@/types/toolbar'

interface HandlerEntry {
  readonly type: string
  handle(msg: ServerMessage, ctx: { emit(event: string, ...args: unknown[]): void }): void
}

export interface SdkStore {
  status: string
  connId: string | null
  panelVisible: boolean
  widgetVisible: boolean
  rightPanelModules?: RightPanelSidebar[]
  activeRightPanelSidebar?: string
  activeRightPanelDetail?: string | null
  toolbarItems?: ToolbarItem[]
  [key: string]: unknown
}

export abstract class BaseSDK {
  protected ws: WsClient | null = null
  protected bus = new EventBus()
  protected options: Record<string, unknown> = {}
  private authTimer: ReturnType<typeof setTimeout> | null = null
  abstract handlers: Map<string, HandlerEntry>

  abstract get connected(): boolean
  protected abstract get logTag(): string
  protected abstract get store(): SdkStore
  protected abstract get pipelineQueue(): { clear(): void }
  protected abstract get sendState(): {
    tempIdToTimer: Map<string, ReturnType<typeof setTimeout>>
    lastSendTime: number
  }
  protected abstract buildAuthMsg(): Record<string, unknown>
  protected abstract mountUI(): void
  protected abstract unmountUI(): void
  protected abstract onSdkOpen(): void
  protected abstract onSdkClose(): void

  get logger() {
    return logger
  }

  on(event: string, cb: (...args: unknown[]) => void): this {
    this.bus.on(event, cb)
    return this
  }
  off(event: string, cb: (...args: unknown[]) => void): this {
    this.bus.off(event, cb)
    return this
  }
  emit(event: string, ...args: unknown[]) {
    this.bus.emitArray(event, args)
  }
  send(msg: Record<string, unknown>) {
    this.ws?.send(msg)
  }
  getStore() {
    return this.store
  }

  /** 认证成功时调用，清除认证超时定时器 */
  resolveAuth(): void {
    if (this.authTimer) {
      clearTimeout(this.authTimer)
      this.authTimer = null
    }
  }

  /** 记录心跳 ACK 时间戳，供 WsClient 检测连接假死 */
  markHeartbeatAck(): void {
    if (this.ws) this.ws.lastHeartbeatAckTs = Date.now()
  }

  async destroy(): Promise<void> {
    logger.debug(`[${this.logTag}] destroy 开始`)
    this.ws?.disconnect()
    this.ws = null
    this.finishDestroy()
  }

  protected finishDestroy() {
    this.resolveAuth()
    clearAllTimers(this.sendState)
    this.unmountUI()
    this.bus.clear()
    this.pipelineQueue.clear()
  }

  protected init(rawOptions: Record<string, unknown>) {
    this.setupLogging(rawOptions)
    this.options = this.processOptions(rawOptions)
    this.ensureMounted()
    this.connect()
  }

  protected processOptions(opts: Record<string, unknown>): Record<string, unknown> {
    return opts
  }

  private setupLogging(rawOptions: Record<string, unknown>) {
    if (rawOptions.tenant_no == null) throw new CcsimError('E001', t('errors.tenantRequired'))
    const level = rawOptions.debug
      ? LogLevel.DEBUG
      : Object.values(LogLevel).includes(rawOptions.logLevel as LogLevel)
        ? (rawOptions.logLevel as LogLevel)
        : LogLevel.INFO
    logger.setLogLevel(level)
    logVersion()
  }

  private defaultWsHost(): string {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${protocol}//${window.location.host}/ws`
    }
    return 'ws://localhost:8080/ws'
  }

  protected connect() {
    this.store.status = 'connecting'
    logger.info(`[${this.logTag}] 开始连接 WebSocket`)

    const rawHost = this.options.wsHost
    let urlProvider: UrlProvider
    if (typeof rawHost === 'function') {
      urlProvider = rawHost as () => string
    } else if (typeof rawHost === 'string') {
      if (!/^wss?:\/\/.+/.test(rawHost)) {
        throw new CcsimError('E001', t('errors.wsInvalid', { host: rawHost }))
      }
      urlProvider = rawHost
    } else {
      urlProvider = this.defaultWsHost()
    }

    this.ws = new WsClient(urlProvider)
    this.ws.onMessage((msg) => this.handleServerMsg(msg))
    this.ws.onParseError((rawData) =>
      this.emit('error', new CcsimError('E002', t('errors.parseFailed'), { raw: rawData })),
    )
    this.ws.onReconnecting((a, m) => this.emit('reconnecting', a, m))
    this.ws.onOpen(() => {
      logger.info(`[${this.logTag}] WebSocket 连接成功`)
      const wasDisconnected = this.store.status === 'disconnected'
      this.store.status = 'connected'
      if (wasDisconnected) this.emit('reconnected')
      this.send(this.buildAuthMsg() as { type: string } & Record<string, unknown>)
      this.authTimer = setTimeout(() => {
        logger.warn(`[${this.logTag}] 认证超时 (${AUTH_TIMEOUT}ms)，断开连接`)
        this.ws?.disconnect()
        this.emit('authTimeout')
      }, AUTH_TIMEOUT)
      this.onSdkOpen()
    })
    this.ws.onClose((code, reason) => {
      if (this.authTimer) {
        clearTimeout(this.authTimer)
        this.authTimer = null
      }
      const st = this.store.status
      if (st === 'connecting' || st === 'connected' || st === 'error') {
        this.store.status = 'disconnected'
        this.store.connId = null
        logger.info(`[${this.logTag}] 连接断开 (code: ${code}, reason: ${reason})`)
        this.emit('disconnected', code, reason)
        this.onSdkClose()
      }
    })
    this.ws.onError((event) => {
      logger.error(`[${this.logTag}] WebSocket 错误:`, event)
      this.store.status = 'error'
      this.emit(
        'error',
        new CcsimError('E001', t('errors.connectionFailed'), { raw: String(event.type || event) }),
      )
    })
    this.ws.connect()
  }

  protected handleServerMsg(msg: ServerMessage) {
    if (msg.type === 'auth_ok') this.resolveAuth()
    const handler = this.handlers.get(msg.type)
    if (!handler) {
      logger.warn(`[${this.logTag}] 未处理的消息类型: ${msg.type}`)
      return
    }
    try {
      handler.handle(msg, this)
    } catch (error) {
      const ccsimErr = toCcsimError(error, 'E003')
      logger.error(`[${this.logTag}] 处理消息 ${msg.type} 异常:`, ccsimErr.toJSON())
      this.emit(
        'error',
        new CcsimError(
          ccsimErr.code,
          t('errors.handleException', { type: msg.type, error: ccsimErr.message }),
          { raw: ccsimErr.details },
        ),
      )
    }
  }

  protected ensureMounted() {
    if (!document.getElementById('ccsim-sdk-root')) {
      this.mountUI()
    }
  }

  registerRightPanelSidebar(module: RightPanelSidebar) {
    if (!this.store.rightPanelModules) {
      this.store.rightPanelModules = []
    }
    const exists = this.store.rightPanelModules.some((m) => m.key === module.key)
    if (exists) {
      logger.warn(`RightPanelSidebar "${module.key}" already registered, skipping`)
      return
    }
    const entry: RightPanelSidebar = { ...module, order: module.order ?? DEFAULT_MODULE_ORDER }
    this.store.rightPanelModules.push(entry)
    this.store.rightPanelModules.sort((a, b) => a.order! - b.order!)
    logger.debug(`RightPanelSidebar "${module.key}" registered`)
  }

  unregisterRightPanelSidebar(key: string) {
    if (!this.store.rightPanelModules) return
    const idx = this.store.rightPanelModules.findIndex((m) => m.key === key)
    if (idx === -1) return
    this.store.rightPanelModules.splice(idx, 1)
    if (this.store.activeRightPanelDetail === key) {
      this.store.activeRightPanelDetail = null
    }
    logger.debug(`RightPanelSidebar "${key}" unregistered`)
  }

  registerToolbar(item: ToolbarItem) {
    if (!this.store.toolbarItems) {
      this.store.toolbarItems = []
    }
    const exists = this.store.toolbarItems.some((p) => p.key === item.key)
    if (exists) {
      logger.warn(`Toolbar "${item.key}" already registered, skipping`)
      return
    }
    this.store.toolbarItems.push(item)
    this.store.toolbarItems.sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
    logger.debug(`Toolbar "${item.key}" registered`)
  }

  unregisterToolbar(key: string) {
    if (!this.store.toolbarItems) return
    const idx = this.store.toolbarItems.findIndex((p) => p.key === key)
    if (idx === -1) return
    this.store.toolbarItems.splice(idx, 1)
    logger.debug(`Toolbar "${key}" unregistered`)
  }
}
