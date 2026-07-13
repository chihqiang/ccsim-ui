import type { ClientMessage, ServerMessage } from '@/agent/types'
import type { MessagePipeline } from '@/agent/messaging/pipeline'
import type { SendState } from '@/agent/messaging/send'
import type { Logger } from '@/core/utils/logger'

export interface HandlerContext {
  _sendState: SendState
  send(msg: ClientMessage): void
  emit(event: string, ...args: unknown[]): void
  readonly pipeline: MessagePipeline
  readonly logger: Logger
  requestSessionList(page?: number, limit?: number, status?: string): void
  requestSessionHistory(sessionId: number, beforeSeq?: number, limit?: number): void
  requestWaitingSessionList(): void
  resetAgentOnlineSent(): void
  setAgentOnline(account: string): void
  markHeartbeatAck(): void
  agentOptions?: { account: string; password: string }
  readonly shouldAutoOnline: boolean
}

export interface MessageHandler<T extends ServerMessage = ServerMessage> {
  readonly type: string
  handle(msg: T, ctx: HandlerContext): void
}
