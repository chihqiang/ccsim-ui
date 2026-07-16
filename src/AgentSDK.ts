import type { AgentInitOptions, SdkEvents, SdkEventName } from '@/types'
import { ClientMessageTypeEnum } from '@/types'
import { store } from '@/store/agent'
import { registerHandlers } from '@/handlers/index'
import { mountApp, unmountApp } from '@/agent/mount'
import { logger } from '@/utils/logger'
import { CcsimError } from '@/utils/errors'
import { buildAgentAuth, formatAgentAccount } from '@/agent/sdk-auth'
import { sendChat, createSendState, type SendChatContext } from '@/messaging/AgentSend'
import { MessagePipeline } from '@/messaging/agentPipeline'
import { BaseSDK } from '@/base-sdk'
import { setLocale, t } from '@/i18n'
import type { RightPanelTab } from '@/types/right-panel'
import { DEFAULT_TAB_KEY, DEFAULT_TAB_ORDER } from '@/types/right-panel'
import type { ToolbarItem } from '@/types/toolbar'
import type { MsgType } from '@/types/store'
import VisitorInfoTab from '@/tabs/VisitorInfo/visitorInfoTab.vue'

type EventCallback<K extends SdkEventName> = SdkEvents[K]

let instance: AgentSDK | null = null
export function getInstance(): AgentSDK | null { return instance }
export { SDK_VERSION } from '@/utils/version'

export class AgentSDK extends BaseSDK {
  handlers = registerHandlers()
  pipeline = new MessagePipeline()
  sendState = createSendState()
  private agentOnlineSent = false
  private agentShouldBeOnline = false
  private destroying = false
  private activeTimer: ReturnType<typeof setTimeout> | null = null

  private static STORAGE_KEY = 'ccsim_agent_should_online'

  constructor(options: AgentInitOptions) {
    super()
    if (instance) { logger.warn('SDK 已初始化，返回已有实例'); return instance }
    instance = this
    try { this.agentShouldBeOnline = localStorage.getItem(AgentSDK.STORAGE_KEY) === '1' } catch { /* noop */ }
    this.init(options as unknown as Record<string, unknown>)
    this._registerDefaults()
  }

  private _registerDefaults() {
    this.registerRightPanelTab({
      key: DEFAULT_TAB_KEY,
      label: '游客信息',
      component: VisitorInfoTab,
      order: DEFAULT_TAB_ORDER,
    })
  }

  protected get logTag() { return 'agent' }
  get connected() { return this.ws?.connected ?? false }
  protected get store() { return store }
  protected get pipelineQueue() { return this.pipeline.queue }
  protected mountUI() { mountApp() }
  protected unmountUI() { unmountApp() }

  get currentSessionId() { return store.currentSessionId }
  get agentName() { return store.agentName }
  get agentId() { return store.agentId }
  get messages() { return store.messagesMap[store.currentSessionId ?? 0] || [] }
  get optimisticMessages() { return store.optimisticMessages }
  get agentOptions() { return this.options as unknown as AgentInitOptions }
  get shouldAutoOnline() { return this.agentShouldBeOnline }

  protected processOptions(opts: Record<string, unknown>): Record<string, unknown> {
    if (!opts.account) throw new CcsimError('E001', t('errors.accountRequired'))
    if (!opts.password) throw new CcsimError('E001', t('errors.passwordRequired'))
    const locale = opts.locale as string
    if (locale === 'en-US' || locale === 'zh-CN') setLocale(locale)
    logger.debug(`客服账号: ${formatAgentAccount(opts.account as string)}`)
    return opts
  }

  protected buildAuthMsg(): Record<string, unknown> {
    return buildAgentAuth(this.agentOptions)
  }

  protected onSdkOpen() {
    logger.debug('发送客服认证')
  }

  protected onSdkClose() {
    this._clearActiveTimer()
    if (store.isAgentOnline) { store.isAgentOnline = false; this.agentOnlineSent = false }
  }

  on<K extends SdkEventName>(event: K, cb: EventCallback<K>): this
  on(event: string, cb: (...args: unknown[]) => void): this
  on(event: string, cb: (...args: unknown[]) => void): this { return super.on(event, cb) }

  off<K extends SdkEventName>(event: K, cb: EventCallback<K>): this
  off(event: string, cb: (...args: unknown[]) => void): this
  off(event: string, cb: (...args: unknown[]) => void): this { return super.off(event, cb) }

  sendChat(content: string, msgType: MsgType = 'text') {
    sendChat(this as unknown as SendChatContext, content, msgType)
    this._resetActiveTimer()
  }

  requestSessionList(page = 1, limit = 50, status?: string) {
    if (this.ws?.connected) {
      this.send({ type: ClientMessageTypeEnum.SESSION_LIST, page, limit, ...(status ? { status } : {}) })
    }
  }

  requestSessionHistory(sessionId: number, beforeSeq?: number, limit?: number) {
    if (this.ws?.connected) {
      this.send({ type: ClientMessageTypeEnum.SESSION_HISTORY, session_id: sessionId, before_seq: beforeSeq ?? 0, limit: limit ?? 20 })
    }
  }

  requestWaitingSessionList() {
    if (this.ws?.connected) {
      this.send({ type: ClientMessageTypeEnum.WAITING_SESSION_LIST })
    }
  }

  resetAgentOnlineSent() { this.agentOnlineSent = false }

  acceptSession(sessionId: number) {
    if (store.agentId == null || !store.isAgentOnline || !this.ws?.connected) return
    if (sessionId == null || sessionId <= 0) { logger.warn('acceptSession: invalid sessionId', sessionId); return }
    this.send({ type: ClientMessageTypeEnum.SESSION_ACCEPT, session_id: sessionId })
    this._resetActiveTimer()
  }

  closeSession(sessionId: number) {
    if (!this.ws?.connected) { logger.warn('WebSocket 未连接'); return }
    this.send({ type: ClientMessageTypeEnum.SESSION_CLOSE, session_id: sessionId })
    this._resetActiveTimer()
  }

  setAgentOnline() {
    if (this.agentOnlineSent || !this.ws?.connected) return
    this.send({ type: ClientMessageTypeEnum.AGENT_ONLINE })
    this.agentOnlineSent = true
    this.agentShouldBeOnline = true
    try { localStorage.setItem(AgentSDK.STORAGE_KEY, '1') } catch { /* noop */ }
    this._startActiveTimer()
  }

  setAgentOffline() {
    if (!this.ws?.connected) return
    this.send({ type: ClientMessageTypeEnum.AGENT_OFFLINE })
    store.isAgentOnline = false
    this.agentOnlineSent = false
    this.agentShouldBeOnline = false
    try { localStorage.removeItem(AgentSDK.STORAGE_KEY) } catch { /* noop */ }
    this._clearActiveTimer()
  }

  /** 重置活跃检测计时器 */
  _resetActiveTimer() {
    if (!store.isAgentOnline) return
    const timeout = this.agentOptions.activeTimeout
    if (!timeout || timeout <= 0) return
    this._clearActiveTimer()
    this.activeTimer = setTimeout(() => {
      logger.warn(`客服超过 ${timeout} 分钟未操作，自动下线`)
      this.setAgentOffline()
      this.emit('activeTimeout')
    }, timeout * 60 * 1000)
  }

  private _startActiveTimer() {
    this._resetActiveTimer()
  }

  private _clearActiveTimer() {
    if (this.activeTimer != null) {
      clearTimeout(this.activeTimer)
      this.activeTimer = null
    }
  }

  sendTyping(sessionId: number) {
    if (!this.ws?.connected) return
    this.send({ type: ClientMessageTypeEnum.TYPING, session_id: sessionId })
    this._resetActiveTimer()
  }

  sendMessageRead(sessionId: number, msgId: number, seqNum: number) {
    if (!this.ws?.connected) return
    this.send({ type: ClientMessageTypeEnum.MESSAGE_READ, session_id: sessionId, msg_id: msgId, seq_num: seqNum })
    this._resetActiveTimer()
  }

  showPanel() {
    this.ensureMounted()
    store.panelVisible = true
    store.widgetVisible = false
  }

  hidePanel() {
    this.ensureMounted()
    store.panelVisible = false
    store.widgetVisible = true
  }

  registerRightPanelTab(tab: RightPanelTab) {
    const exists = store.rightPanelTabs.some(t => t.key === tab.key)
    if (exists) {
      logger.warn(`RightPanelTab "${tab.key}" already registered, skipping`)
      return
    }
    const entry: RightPanelTab = { ...tab, order: tab.order ?? DEFAULT_TAB_ORDER }
    store.rightPanelTabs.push(entry)
    store.rightPanelTabs.sort((a, b) => a.order! - b.order!)
    logger.debug(`RightPanelTab "${tab.key}" registered`)
  }

  unregisterRightPanelTab(key: string) {
    const idx = store.rightPanelTabs.findIndex(t => t.key === key)
    if (idx === -1) return
    store.rightPanelTabs.splice(idx, 1)
    if (store.activeRightPanelTab === key) {
      store.activeRightPanelTab = store.rightPanelTabs[0]?.key ?? DEFAULT_TAB_KEY
    }
    logger.debug(`RightPanelTab "${key}" unregistered`)
  }

  registerToolbar(item: ToolbarItem) {
    const exists = store.toolbarItems.some(p => p.key === item.key)
    if (exists) {
      logger.warn(`Toolbar "${item.key}" already registered, skipping`)
      return
    }
    store.toolbarItems.push(item)
    store.toolbarItems.sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
    logger.debug(`Toolbar "${item.key}" registered`)
  }

  unregisterToolbar(key: string) {
    const idx = store.toolbarItems.findIndex(p => p.key === key)
    if (idx === -1) return
    store.toolbarItems.splice(idx, 1)
    logger.debug(`Toolbar "${key}" unregistered`)
  }

  async destroy(): Promise<void> {
    if (this.destroying) return
    this.destroying = true
    this._clearActiveTimer()
    logger.debug('SDK destroy 开始')
    if (this.ws?.connected) this.setAgentOffline()
    await super.destroy()
  }
}
