import type { SessionAssigned } from '@/visitor/types'
import type { HandlerContext, MessageHandler } from '@/visitor/handlers/context'
import { store } from '@/visitor/store/store'
import { saveSessionId } from '@/visitor/store/visitorStorage'

export class SessionAssignedHandler implements MessageHandler<SessionAssigned> {
  readonly type = 'session_assigned'
  handle(msg: SessionAssigned, ctx: HandlerContext): void {
    store.sessionId = msg.session_id
    saveSessionId(msg.session_id)
    store.historyLoading = true
    ctx.requestSessionHistory(msg.session_id)
    ctx.emit('sessionAssigned', msg.session_id)
  }
}
