import type { ClientMessage, ServerMessage } from '@/visitor/types'
import type { MessagePipeline } from '@/visitor/messaging/pipeline'
import type { SendState } from '@/visitor/messaging/send'
import type { Logger } from '@/core/utils/logger'

export interface HandlerContext {
  _sendState: SendState
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
