import type { VisitorInitOptions, SdkEvents, SdkEventName } from '@/visitor/types'
import { ClientMessageTypeEnum } from '@/visitor/types'
import { store } from '@/visitor/store/store'
import { registerHandlers } from '@/visitor/handlers'
import { mountApp, unmountApp } from '@/visitor/ui/mount'
import { logger } from '@/core/utils/logger'
import { resolveVisitorUUID } from '@/visitor/store/visitorStorage'
import { buildVisitorAuth } from '@/visitor/sdk-auth'
import { sendChat, createSendState, type SendChatContext } from '@/visitor/messaging/send'
import { MessagePipeline } from '@/visitor/messaging/pipeline'
import { BaseSDK } from '@/core/base-sdk'
import { setLocale, t } from '@/core/i18n'

type EventCallback<K extends SdkEventName> = SdkEvents[K]

let instance: VisitorSDK | null = null
export function getInstance(): VisitorSDK | null { return instance }
export { SDK_VERSION } from '@/core/utils/version'

export class VisitorSDK extends BaseSDK {
  handlers = registerHandlers()
  pipeline = new MessagePipeline()
  _sendState = createSendState()

  constructor(options: VisitorInitOptions) {
    super()
    if (instance) { logger.warn('SDK 已初始化，返回已有实例'); return instance }
    instance = this
    this.init(options as unknown as Record<string, unknown>)
  }

  protected get logTag() { return 'visitor' }
  get connected() { return this.ws?.connected ?? false }
  protected get store() { return store }
  protected get pipelineQueue() { return this.pipeline.queue }
  protected get sendState() { return this._sendState }
  protected mountUI() { mountApp() }
  protected unmountUI() { unmountApp() }

  get sessionId() { return store.sessionId }
  get visitorId() { return store.visitorId }
  get messages() { return store.messages }
  get visitorOptions() { return this.options as unknown as VisitorInitOptions }

  protected processOptions(opts: Record<string, unknown>): Record<string, unknown> {
    const resolvedUUID = resolveVisitorUUID(opts.visitor_uuid as string | undefined)
    const locale = opts.locale as string
    if (locale === 'en-US' || locale === 'zh-CN') setLocale(locale)
    return { ...opts, visitor_uuid: resolvedUUID }
  }

  protected buildAuthMsg(): Record<string, unknown> {
    return buildVisitorAuth(this.options as unknown as VisitorInitOptions)
  }

  protected onSdkOpen() {
    logger.debug('发送访客认证')
  }

  protected onSdkClose() {
    store.agentOnlineCount = 0
    store.hasOnlineAgent = false
  }

  on<K extends SdkEventName>(event: K, cb: EventCallback<K>): this
  on(event: string, cb: (...args: unknown[]) => void): this
  on(event: string, cb: (...args: unknown[]) => void): this { return super.on(event, cb) }

  off<K extends SdkEventName>(event: K, cb: EventCallback<K>): this
  off(event: string, cb: (...args: unknown[]) => void): this
  off(event: string, cb: (...args: unknown[]) => void): this { return super.off(event, cb) }

  sendChat(content: string, msgType = 'text') { sendChat(this as unknown as SendChatContext, content, msgType) }

  requestSessionHistory(sessionId: number, beforeSeq?: number, limit?: number) {
    if (this.ws?.connected) {
      this.send({ type: ClientMessageTypeEnum.SESSION_HISTORY, session_id: sessionId, before_seq: beforeSeq ?? 0, limit: limit ?? 20 })
    } else { logger.warn('WebSocket 未连接') }
  }

  closeSession(sessionId: number) {
    if (!this.ws?.connected) { logger.warn('WebSocket 未连接'); return }
    this.send({ type: ClientMessageTypeEnum.SESSION_CLOSE, session_id: sessionId })
  }

  rateSession(sessionId: number, rating: number) {
    if (![1, 2, 3].includes(rating)) {
      logger.warn('无效评价分数')
      this.emit('messageError', t('send.invalidRating'))
      return
    }
    if (this.ws?.connected) {
      this.send({ type: ClientMessageTypeEnum.SATISFACTION_RATE, session_id: sessionId, rating })
    } else {
      logger.warn('WebSocket 未连接，无法提交评价')
    }
  }

  sendTyping(sessionId: number) {
    if (!this.ws?.connected) return
    this.send({ type: ClientMessageTypeEnum.TYPING, session_id: sessionId })
  }

  sendMessageRead(sessionId: number, msgId: number, seqNum: number) {
    if (!this.ws?.connected) return
    this.send({ type: ClientMessageTypeEnum.MESSAGE_READ, session_id: sessionId, msg_id: msgId, seq_num: seqNum })
  }

  updateVisitorInfo(info: { nickname?: string; phone?: string; avatar?: string; metadata?: string }) {
    if (!this.ws?.connected) { logger.warn('WebSocket 未连接'); return }
    const ALLOWED = new Set(['nickname', 'phone', 'avatar', 'metadata'])
    const filtered: Record<string, unknown> = { type: ClientMessageTypeEnum.USER_UPDATE }
    for (const key of ALLOWED) {
      if (key in info && info[key as keyof typeof info] !== undefined) {
        filtered[key] = info[key as keyof typeof info]
      }
    }
    this.send(filtered)
  }

  showPanel() {
    this.ensureMounted()
    store.panelVisible = true
    store.widgetVisible = false
    if (store.unreadCount > 0) {
      store.unreadCount = 0
      const lastMsg = store.messages[store.messages.length - 1]
      if (lastMsg?.msgId) {
        this.sendMessageRead(lastMsg.sessionId, lastMsg.msgId, lastMsg.seqNum)
      }
    }
  }

  hidePanel() {
    this.ensureMounted()
    store.panelVisible = false
    store.widgetVisible = true
  }
}
