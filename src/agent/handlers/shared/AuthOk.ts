import type { AuthOk } from '@/agent/types'
import type { HandlerContext, MessageHandler } from '@/agent/handlers/context'
import { store, resetStore } from '@/agent/store/store'
import { logger } from '@/core/utils/logger'
import { SDKStatusEnum } from '@/core/types/sdk'

export class AuthOkHandler implements MessageHandler<AuthOk> {
  readonly type = 'auth_ok'
  handle(msg: AuthOk, ctx: HandlerContext): void {
    const isReconnect = store.connId != null && store.connId !== msg.conn_id
    if (isReconnect) {
      logger.info('重连后清除过期会话状态')
      resetStore()
      store.status = SDKStatusEnum.CONNECTED
    }

    store.connId = msg.conn_id
    if (msg.agent_id) store.agentId = msg.agent_id
    store.agentName = ctx.agentOptions?.account ?? ''

    if (ctx.shouldAutoOnline) {
      ctx.resetAgentOnlineSent()
      ctx.setAgentOnline(ctx.agentOptions?.account ?? '')
    }

    ctx.emit('allSet')
  }
}
