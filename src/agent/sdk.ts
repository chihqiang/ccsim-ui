import type { AgentInitOptions, SdkEvents, SdkEventName } from '@/agent/types'
import { ClientMessageTypeEnum } from '@/agent/types'
import { store } from '@/agent/store/store'
import { registerHandlers } from '@/agent/handlers'
import { mountApp, unmountApp } from '@/agent/ui/mount'
import { logger } from '@/core/utils/logger'
import { CcsimError } from '@/core/utils/errors'
import { buildAgentAuth, formatAgentAccount } from '@/agent/sdk-auth'
import { sendChat, createSendState, type SendChatContext } from '@/agent/messaging/send'
import { MessagePipeline } from '@/agent/messaging/pipeline'
import { BaseSDK } from '@/core/base-sdk'
import { setLocale } from '@/core/i18n'

type EventCallback<K extends SdkEventName> = SdkEvents[K]

let instance: AgentSDK | null = null
export function getInstance(): AgentSDK | null { return instance }
export { SDK_VERSION } from '@/core/utils/version'

export class AgentSDK extends BaseSDK {
  handlers = registerHandlers()
  pipeline = new MessagePipeline()
  _sendState = createSendState()
  private _agentOnlineSent = false
  private _agentShouldBeOnline = false
  private _destroying = false

  private static STORAGE_KEY = 'ccsim_agent_should_online'

  constructor(options: AgentInitOptions) {
    super()
    if (instance) { logger.warn('SDK 已初始化，返回已有实例'); return instance }
    instance = this
    try { this._agentShouldBeOnline = localStorage.getItem(AgentSDK.STORAGE_KEY) === '1' } catch { /* noop */ }
    this.init(options as unknown as Record<string, unknown>)
  }

  protected get logTag() { return 'agent' }
  get connected() { return this.ws?.connected ?? false }
  protected get store() { return store }
  protected get pipelineQueue() { return this.pipeline.queue }
  protected get sendState() { return this._sendState }
  protected mountUI() { mountApp() }
  protected unmountUI() { unmountApp() }

  get currentSessionId() { return store.currentSessionId }
  get agentName() { return store.agentName }
  get agentId() { return store.agentId }
  get messages() { return store.messagesMap[store.currentSessionId ?? 0] || [] }
  get optimisticMessages() { return store.optimisticMessages }
  get agentOptions() { return this.options as unknown as AgentInitOptions }
  get shouldAutoOnline() { return this._agentShouldBeOnline }

  protected processOptions(opts: Record<string, unknown>): Record<string, unknown> {
    if (!opts.account) throw new CcsimError('E001', '客服账号是必填参数')
    if (!opts.password) throw new CcsimError('E001', '客服密码是必填参数')
    const locale = opts.locale as string
    if (locale === 'en-US' || locale === 'zh-CN') setLocale(locale)
    logger.debug(`客服账号: ${formatAgentAccount(opts.account as string)}`)
    return opts
  }

  protected buildAuthMsg(): Record<string, unknown> {
    return buildAgentAuth(this.options as unknown as AgentInitOptions)
  }

  protected onSdkOpen() {
    logger.debug('发送客服认证')
  }

  protected onSdkClose() {
    if (store.isAgentOnline) { store.isAgentOnline = false; this._agentOnlineSent = false }
  }

  on<K extends SdkEventName>(event: K, cb: EventCallback<K>): this
  on(event: string, cb: (...args: unknown[]) => void): this
  on(event: string, cb: (...args: unknown[]) => void): this { return super.on(event, cb) }

  off<K extends SdkEventName>(event: K, cb: EventCallback<K>): this
  off(event: string, cb: (...args: unknown[]) => void): this
  off(event: string, cb: (...args: unknown[]) => void): this { return super.off(event, cb) }

  sendChat(content: string, msgType = 'text') { sendChat(this as unknown as SendChatContext, content, msgType) }

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

  resetAgentOnlineSent() { this._agentOnlineSent = false }

  acceptSession(sessionId: number) {
    if (store.agentId == null || !store.isAgentOnline || !this.ws?.connected) return
    if (sessionId == null || sessionId <= 0) { logger.warn('acceptSession: invalid sessionId', sessionId); return }
    this.send({ type: ClientMessageTypeEnum.SESSION_ACCEPT, session_id: sessionId })
  }

  closeSession(sessionId: number) {
    if (!this.ws?.connected) { logger.warn('WebSocket 未连接'); return }
    this.send({ type: ClientMessageTypeEnum.SESSION_CLOSE, session_id: sessionId })
  }

  setAgentOnline() {
    if (this._agentOnlineSent || !this.ws?.connected) return
    this.send({ type: ClientMessageTypeEnum.AGENT_ONLINE })
    this._agentOnlineSent = true
    this._agentShouldBeOnline = true
    try { localStorage.setItem(AgentSDK.STORAGE_KEY, '1') } catch { /* noop */ }
  }

  setAgentOffline() {
    if (!this.ws?.connected) return
    this.send({ type: ClientMessageTypeEnum.AGENT_OFFLINE })
    store.isAgentOnline = false
    this._agentOnlineSent = false
    this._agentShouldBeOnline = false
    try { localStorage.removeItem(AgentSDK.STORAGE_KEY) } catch { /* noop */ }
  }

  sendTyping(sessionId: number) {
    if (!this.ws?.connected) return
    this.send({ type: ClientMessageTypeEnum.TYPING, session_id: sessionId })
  }

  sendMessageRead(sessionId: number, msgId: number, seqNum: number) {
    if (!this.ws?.connected) return
    this.send({ type: ClientMessageTypeEnum.MESSAGE_READ, session_id: sessionId, msg_id: msgId, seq_num: seqNum })
  }

  markHeartbeatAck(): void {
    if (this.ws) this.ws.lastHeartbeatAckTs = Date.now()
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

  async destroy(): Promise<void> {
    if (this._destroying) return
    this._destroying = true
    logger.debug('SDK destroy 开始')
    if (this.ws?.connected) this.setAgentOffline()
    this.ws?.disconnect()
    this.ws = null
    this.finishDestroy()
  }
}
