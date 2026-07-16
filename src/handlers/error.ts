import type { ErrorMsg } from '@/types/serverMessage'
import type { MessageHandler } from '@/handlers/coreContext'
import { logger } from '@/utils/logger'
import { t } from '@/i18n'

export class ErrorHandler implements MessageHandler<ErrorMsg> {
  readonly type = 'error'
  handle(msg: ErrorMsg, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    const text = msg.err_msg ?? msg.message ?? t('errors.unknownError')
    logger.warn(`Server error: [${msg.code}] ${text}`)
    ctx.emit('error', new Error(`[${msg.code}] ${text}`))
  }
}
