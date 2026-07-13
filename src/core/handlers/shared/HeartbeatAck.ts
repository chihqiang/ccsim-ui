import type { HeartbeatAck } from '@/core/types/serverMessage'
import type { MessageHandler } from '@/core/handlers/context'

export class HeartbeatAckHandler implements MessageHandler<HeartbeatAck> {
  readonly type = 'heartbeat_ack'
  handle(_msg: HeartbeatAck, ctx: { emit(event: string, ...args: unknown[]): void; markHeartbeatAck(): void }): void {
    ctx.markHeartbeatAck()
  }
}
