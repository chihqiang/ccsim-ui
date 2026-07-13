import type { SatisfactionRateRes } from '@/visitor/types'
import type { MessageHandler } from '@/visitor/handlers/context'

export class SatisfactionRateHandler implements MessageHandler<SatisfactionRateRes> {
  readonly type = 'satisfaction_rate'
  handle(msg: SatisfactionRateRes, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    ctx.emit('satisfactionRated', msg.session_id, msg.status)
  }
}
