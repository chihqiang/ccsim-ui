import type { VisitorUpdateOk } from '@/visitor/types'
import type { MessageHandler } from '@/visitor/handlers/context'

export class VisitorUpdateOkHandler implements MessageHandler<VisitorUpdateOk> {
  readonly type = 'visitor_update_ok'
  handle(_msg: VisitorUpdateOk, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    ctx.emit('visitorInfoUpdated')
  }
}
