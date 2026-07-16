import type { SessionCloseAck } from '@/types/serverMessage'
import type { MessageHandler } from '@/handlers/agentContext'

export class AgentSessionCloseAckHandler implements MessageHandler<SessionCloseAck> {
  readonly type = 'session_close'
  handle(msg: SessionCloseAck, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    ctx.emit('sessionCloseAck', msg.session_id, msg.close_reason)
  }
}
