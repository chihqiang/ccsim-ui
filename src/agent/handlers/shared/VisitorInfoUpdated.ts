import type { VisitorInfoUpdated } from '@/agent/types'
import type { MessageHandler } from '@/agent/handlers/context'

export class VisitorInfoUpdatedHandler implements MessageHandler<VisitorInfoUpdated> {
  readonly type = 'visitor_info_updated'
  handle(msg: VisitorInfoUpdated, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    ctx.emit('visitorInfoUpdated', msg.session_id, msg.visitor_id, msg.nickname, msg.phone, msg.avatar)
  }
}
