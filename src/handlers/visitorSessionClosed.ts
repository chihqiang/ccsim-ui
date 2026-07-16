import type { SessionClosed } from '@/types'
import type { HandlerContext, MessageHandler } from '@/handlers/visitorContext'
import { store } from '@/store/visitor'
import { clearSessionId } from '@/store/visitorStorage'
import { logger } from '@/utils/logger'
import { showRate } from '@/toolbar/satisfaction/state'

export class VisitorSessionClosedHandler implements MessageHandler<SessionClosed> {
  readonly type = 'session_closed'
  handle(msg: SessionClosed, ctx: HandlerContext): void {
    logger.info(`会话已关闭: session_id=${msg.session_id}, reason=${msg.close_reason || 'unknown'}`)

    ctx.pipeline.queue.removeBySessionId(msg.session_id)
    store.sessionId = null
    store.messages = []
    clearSessionId()

    showRate(msg.session_id)

    ctx.emit('endSession', msg.session_id)
  }
}
