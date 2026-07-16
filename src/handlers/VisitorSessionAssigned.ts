import type { SessionAssigned } from '@/types'
import type { HandlerContext, MessageHandler } from '@/handlers/visitorContext'
import { store } from '@/store/visitor'
import { saveSessionId } from '@/store/visitorStorage'

export class VisitorSessionAssignedHandler implements MessageHandler<SessionAssigned> {
  readonly type = 'session_assigned'
  handle(msg: SessionAssigned, ctx: HandlerContext): void {
    store.sessionId = msg.session_id
    saveSessionId(msg.session_id)
    store.historyLoading = true
    ctx.requestSessionHistory(msg.session_id)
    ctx.emit('sessionAssigned', msg.session_id)
  }
}
