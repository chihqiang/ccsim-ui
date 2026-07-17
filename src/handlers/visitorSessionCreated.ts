import type { SessionCreated } from '@/types'
import type { HandlerContext, MessageHandler } from '@/handlers/visitorContext'
import { store } from '@/store/visitor'
import { saveSessionId, saveHadSession } from '@/store/visitorStorage'
import { logger } from '@/utils/logger'

export class VisitorSessionCreatedHandler implements MessageHandler<SessionCreated> {
  readonly type = 'session_created'
  handle(msg: SessionCreated, ctx: HandlerContext): void {
    logger.info(`会话已创建: session_id=${msg.session_id}, status=${msg.status}`)
    store.sessionId = msg.session_id
    store.hadSession = true
    saveHadSession()
    saveSessionId(msg.session_id)
    store.historyLoading = true
    ctx.requestSessionHistory(msg.session_id)
    ctx.emit('startSession', msg.session_id)
  }
}
