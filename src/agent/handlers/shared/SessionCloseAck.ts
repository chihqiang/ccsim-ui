import type { SessionCloseAck } from '@/core/types/serverMessage'
import type { MessageHandler } from '@/agent/handlers/context'

export class SessionCloseAckHandler implements MessageHandler<SessionCloseAck> {
  readonly type = 'session_close'
  handle(msg: SessionCloseAck, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    ctx.emit('sessionCloseAck', msg.session_id, msg.close_reason)
  }
}
