import type { VisitorUpdateOk } from '@/types'
import type { MessageHandler } from '@/handlers/visitorContext'

export class VisitorUpdateOkHandler implements MessageHandler<VisitorUpdateOk> {
  readonly type = 'visitor_update_ok'
  handle(_msg: VisitorUpdateOk, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    ctx.emit('visitorInfoUpdated')
  }
}
