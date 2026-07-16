import type { ClientMessage, ServerMessage } from '@/types'
import type { MessagePipeline } from '@/messaging/visitorPipeline'
import type { SendState } from '@/messaging/coreSend'
import type { Logger } from '@/utils/logger'

export interface HandlerContext {
  sendState: SendState
  send(msg: ClientMessage): void
  emit(event: string, ...args: unknown[]): void
  readonly pipeline: MessagePipeline
  readonly logger: Logger
  requestSessionHistory(sessionId: number, beforeSeq?: number, limit?: number): void
  markHeartbeatAck(): void
}

export interface MessageHandler<T extends ServerMessage = ServerMessage> {
  readonly type: string
  handle(msg: T, ctx: HandlerContext): void
}
