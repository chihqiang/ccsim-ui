import type { HeartbeatAck } from '@/types/serverMessage'
import type { MessageHandler } from '@/handlers/coreContext'

export class HeartbeatAckHandler implements MessageHandler<HeartbeatAck> {
  readonly type = 'heartbeat_ack'
  handle(
    _msg: HeartbeatAck,
    ctx: { emit(event: string, ...args: unknown[]): void; markHeartbeatAck(): void },
  ): void {
    ctx.markHeartbeatAck()
  }
}
