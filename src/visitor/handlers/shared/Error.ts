import type { ErrorMsg } from '@/visitor/types'
import type { MessageHandler } from '@/visitor/handlers/context'
import { logger } from '@/core/utils/logger'
import { t } from '@/core/i18n'

export class ErrorHandler implements MessageHandler<ErrorMsg> {
  readonly type = 'error'
  handle(msg: ErrorMsg, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    // ccsim backend sends err_msg; fall back to message for backward compat
    const text = msg.err_msg ?? msg.message ?? t('errors.unknownError')
    logger.warn(`服务端错误: [${msg.code}] ${text}`)
    ctx.emit('error', new Error(`[${msg.code}] ${text}`))
  }
}
