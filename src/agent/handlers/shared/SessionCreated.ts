import type { SessionCreated } from '@/agent/types'
import type { MessageHandler } from '@/agent/handlers/context'
import { logger } from '@/core/utils/logger'

export class SessionCreatedHandler implements MessageHandler<SessionCreated> {
  readonly type = 'session_created'
  handle(msg: SessionCreated, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    logger.info(`新会话创建通知: session_id=${msg.session_id}, status=${msg.status}`)
    ctx.emit('newSession', msg.session_id)
  }
}
