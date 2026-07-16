import type { HandlerContext, MessageHandler } from '@/handlers/agentContext'
import type { ServerMessage } from '@/types'
import { store } from '@/store/agent'
import { logger } from '@/utils/logger'

export class AgentOfflineAckHandler implements MessageHandler<ServerMessage> {
  readonly type = 'agent_offline'

  handle(_msg: ServerMessage, _ctx: HandlerContext): void {
    if (!store.isAgentOnline) return
    store.isAgentOnline = false
    logger.info('AgentOfflineAck: agent is now offline')
  }
}
