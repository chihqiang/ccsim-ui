import type { VisitorInitOptions, SdkEvents, SdkEventName } from '@/types'
import { ClientMessageTypeEnum } from '@/types'
import { store } from '@/store/visitor'
import { registerHandlers } from '@/handlers/visitor'
import { mountApp, unmountApp } from '@/visitor/mount'
import { logger } from '@/utils/logger'
import { resolveVisitorUUID } from '@/store/visitorStorage'
import { buildVisitorAuth } from '@/visitor/sdk-auth'
import { sendChat, createSendState, type SendChatContext } from '@/messaging/VisitorSend'
import { MessagePipeline } from '@/messaging/visitorPipeline'
import { BaseSDK } from '@/base-sdk'
import { setLocale, t } from '@/i18n'
import type { ToolbarItem } from '@/types/toolbar'
import type { PanelSection } from '@/types/panel-section'
import { satisfactionState, showRate, hideRate } from '@/toolbar/satisfaction/state'
import { CcsimError } from '@/utils/errors'
import type { MsgType } from '@/types/store'
import SatisfactionRate from '@/toolbar/satisfaction/satisfactionRate.vue'

type EventCallback<K extends SdkEventName> = SdkEvents[K]

let instance: VisitorSDK | null = null
export function getInstance(): VisitorSDK | null {
  return instance
}
export { SDK_VERSION } from '@/utils/version'

export class VisitorSDK extends BaseSDK {
  handlers = registerHandlers()
  pipeline = new MessagePipeline()
  sendState = createSendState()

  constructor(options: VisitorInitOptions) {
    super()
    if (instance) {
      logger.warn('SDK 已初始化，返回已有实例')
      return instance
    }
    instance = this
    this.init(options as unknown as Record<string, unknown>)
    this._registerDefaults()
  }

  private _registerDefaults() {
    this.registerToolbar({
      key: 'satisfaction',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>',
      label: '评价',
      order: 100,
      active: () => satisfactionState.showRateCard,
      onClick: (ctx) => (ctx.active ? hideRate() : showRate(store.sessionId)),
      show: (ctx) => ctx.sessionId != null,
      panel: {
        component: SatisfactionRate,
        show: () => satisfactionState.showRateCard,
      },
    })
  }

  protected get logTag() {
    return 'visitor'
  }
  get connected() {
    return this.ws?.connected ?? false
  }
  protected get store() {
    return store
  }
  protected get pipelineQueue() {
    return this.pipeline.queue
  }
  protected mountUI() {
    mountApp()
  }
  protected unmountUI() {
    unmountApp()
  }

  get sessionId() {
    return store.sessionId
  }
  get visitorId() {
    return store.visitorId
  }
  get messages() {
    return store.messages
  }
  get visitorOptions() {
    return this.options as unknown as VisitorInitOptions
  }

  protected processOptions(opts: Record<string, unknown>): Record<string, unknown> {
    if (!opts.platform) throw new CcsimError('E001', t('errors.platformRequired'))
    const resolvedUUID = resolveVisitorUUID(opts.visitor_uuid as string | undefined)
    const locale = opts.locale as string
    if (locale === 'en-US' || locale === 'zh-CN') setLocale(locale)
    return { ...opts, visitor_uuid: resolvedUUID }
  }

  protected buildAuthMsg(): Record<string, unknown> {
    return buildVisitorAuth(this.visitorOptions)
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
  on(event: string, cb: (...args: unknown[]) => void): this {
    return super.on(event, cb)
  }

  off<K extends SdkEventName>(event: K, cb: EventCallback<K>): this
  off(event: string, cb: (...args: unknown[]) => void): this
  off(event: string, cb: (...args: unknown[]) => void): this {
    return super.off(event, cb)
  }

  sendChat(content: string, msgType: MsgType = 'text') {
    sendChat(this as unknown as SendChatContext, content, msgType)
  }

  requestSessionHistory(sessionId: number, beforeSeq?: number, limit?: number) {
    if (this.ws?.connected) {
      this.send({
        type: ClientMessageTypeEnum.SESSION_HISTORY,
        session_id: sessionId,
        before_seq: beforeSeq ?? 0,
        limit: limit ?? 20,
      })
    } else {
      logger.warn('WebSocket 未连接')
    }
  }

  closeSession(sessionId: number) {
    if (!this.ws?.connected) {
      logger.warn('WebSocket 未连接')
      return
    }
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
    this.send({
      type: ClientMessageTypeEnum.MESSAGE_READ,
      session_id: sessionId,
      msg_id: msgId,
      seq_num: seqNum,
    })
  }

  updateVisitorInfo(info: {
    nickname?: string
    phone?: string
    avatar?: string
    metadata?: string
  }) {
    if (!this.ws?.connected) {
      logger.warn('WebSocket 未连接')
      return
    }
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

  registerToolbar(item: ToolbarItem) {
    const exists = store.toolbarItems.some((p) => p.key === item.key)
    if (exists) {
      logger.warn(`Toolbar "${item.key}" already registered, skipping`)
      return
    }
    store.toolbarItems.push(item)
    store.toolbarItems.sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
    logger.debug(`Toolbar "${item.key}" registered`)

    // 自动注册关联的 panel section
    if (item.panel) {
      const resolveComponent =
        typeof item.panel.component === 'function' && item.panel.component.length === 0
          ? (item.panel.component as () => Promise<import('vue').Component>)()
          : Promise.resolve(item.panel.component as import('vue').Component)
      resolveComponent.then((component) => {
        this.registerPanelSection({
          key: item.key,
          component,
          order: item.order,
          show: item.panel!.show,
        })
      })
    }
  }

  unregisterToolbar(key: string) {
    const idx = store.toolbarItems.findIndex((p) => p.key === key)
    if (idx === -1) return
    store.toolbarItems.splice(idx, 1)
    this.unregisterPanelSection(key)
    logger.debug(`Toolbar "${key}" unregistered`)
  }

  registerPanelSection(section: PanelSection) {
    const exists = store.panelSections.some((s) => s.key === section.key)
    if (exists) {
      logger.warn(`PanelSection "${section.key}" already registered, skipping`)
      return
    }
    store.panelSections.push(section)
    store.panelSections.sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
    logger.debug(`PanelSection "${section.key}" registered`)
  }

  unregisterPanelSection(key: string) {
    const idx = store.panelSections.findIndex((s) => s.key === key)
    if (idx === -1) return
    store.panelSections.splice(idx, 1)
    logger.debug(`PanelSection "${key}" unregistered`)
  }
}
