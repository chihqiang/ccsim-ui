import type { HandlerContext, MessageHandler } from '@/agent/handlers/context'
import type { ServerMessage } from '@/agent/types'
import { store } from '@/agent/store/store'
import { logger } from '@/core/utils/logger'

export class AgentOfflineAckHandler implements MessageHandler<ServerMessage> {
  readonly type = 'agent_offline'

  handle(_msg: ServerMessage, _ctx: HandlerContext): void {
    if (!store.isAgentOnline) return
    store.isAgentOnline = false
    logger.info('AgentOfflineAck: agent is now offline')
  }
}
