import type { SessionClosed } from '@/visitor/types'
import type { HandlerContext, MessageHandler } from '@/visitor/handlers/context'
import { store } from '@/visitor/store/store'
import { clearSessionId } from '@/visitor/store/visitorStorage'
import { logger } from '@/core/utils/logger'

export class SessionClosedHandler implements MessageHandler<SessionClosed> {
  readonly type = 'session_closed'
  handle(msg: SessionClosed, ctx: HandlerContext): void {
    logger.info(`会话已关闭: session_id=${msg.session_id}, reason=${msg.close_reason || 'unknown'}`)

    ctx.pipeline.queue.removeBySessionId(msg.session_id)
    store.sessionId = null
    store.messages = []
    clearSessionId()

    store.rateCardSessionId = msg.session_id
    store.showRateCard = true

    ctx.emit('endSession', msg.session_id)
  }
}
