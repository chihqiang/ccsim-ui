import type { SatisfactionRateRes } from '@/types'
import type { MessageHandler } from '@/handlers/visitorContext'

export class SatisfactionRateHandler implements MessageHandler<SatisfactionRateRes> {
  readonly type = 'satisfaction_rate'
  handle(msg: SatisfactionRateRes, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    ctx.emit('satisfactionRated', msg.session_id, msg.status)
  }
}
