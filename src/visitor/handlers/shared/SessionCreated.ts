import type { SessionCreated } from '@/visitor/types'
import type { HandlerContext, MessageHandler } from '@/visitor/handlers/context'
import { store } from '@/visitor/store/store'
import { saveSessionId } from '@/visitor/store/visitorStorage'
import { logger } from '@/core/utils/logger'

export class SessionCreatedHandler implements MessageHandler<SessionCreated> {
  readonly type = 'session_created'
  handle(msg: SessionCreated, ctx: HandlerContext): void {
    logger.info(`会话已创建: session_id=${msg.session_id}, status=${msg.status}`)
    store.sessionId = msg.session_id
    saveSessionId(msg.session_id)
    store.historyLoading = true
    ctx.requestSessionHistory(msg.session_id)
    ctx.emit('startSession', msg.session_id)
  }
}
