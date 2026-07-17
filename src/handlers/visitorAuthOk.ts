import type { AuthOk } from '@/types'
import type { HandlerContext, MessageHandler } from '@/handlers/visitorContext'
import { store, resetStore } from '@/store/visitor'
import { loadSessionId, loadHadSession } from '@/store/visitorStorage'
import { logger } from '@/utils/logger'
import { SDKStatusEnum } from '@/types/sdk'

export class VisitorAuthOkHandler implements MessageHandler<AuthOk> {
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
      store.hadSession = true
      store.historyLoading = true
      ctx.requestSessionHistory(sid)
    } else if (loadHadSession()) {
      store.hadSession = true
    }
    ctx.emit('allSet')
  }
}
