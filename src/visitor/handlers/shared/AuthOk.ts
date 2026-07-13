import type { AuthOk } from '@/visitor/types'
import type { HandlerContext, MessageHandler } from '@/visitor/handlers/context'
import { store, resetStore } from '@/visitor/store/store'
import { loadSessionId } from '@/visitor/store/visitorStorage'
import { logger } from '@/core/utils/logger'
import { SDKStatusEnum } from '@/core/types/sdk'

export class AuthOkHandler implements MessageHandler<AuthOk> {
  readonly type = 'auth_ok'
  handle(msg: AuthOk, ctx: HandlerContext): void {
    const isReconnect = store.connId != null && store.connId !== msg.conn_id
    if (isReconnect) {
      logger.info('重连后清除过期访客状态')
      resetStore()
      store.status = SDKStatusEnum.CONNECTED
    }

    store.connId = msg.conn_id
    if (msg.visitor_id) store.visitorId = msg.visitor_id
    // 恢复之前持久化的 sessionId 并加载历史
    const sid = loadSessionId()
    if (sid != null && store.status === 'connected') {
      store.sessionId = sid
      store.historyLoading = true
      ctx.requestSessionHistory(sid)
    }
    ctx.emit('allSet')
  }
}
