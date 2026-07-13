/**
 * Error 消息处理器
 *
 * 处理服务端返回的错误消息。
 * 后端错误格式：{ type: "error", code: "...", err_msg: "..." }
 */
import type { ErrorMsg } from '@/agent/types'
import type { HandlerContext, MessageHandler } from '@/agent/handlers/context'
import { logger } from '@/core/utils/logger'
import { t } from '@/core/i18n'

export class ErrorHandler implements MessageHandler<ErrorMsg> {
  readonly type = 'error'

  handle(msg: ErrorMsg, ctx: HandlerContext): void {
    const text = msg.err_msg ?? msg.message ?? t('errors.unknownError')
    logger.warn(`Server error: [${msg.code}] ${text}`)
    ctx.emit('error', new Error(`[${msg.code}] ${text}`))
  }
}
