import type { AgentStatus } from '@/types'
import type { MessageHandler } from '@/handlers/visitorContext'
import { store } from '@/store/visitor'

export class VisitorAgentStatusHandler implements MessageHandler<AgentStatus> {
  readonly type = 'agent_status'
  handle(msg: AgentStatus, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    store.agentOnlineCount = msg.online_count
    store.hasOnlineAgent = msg.has_online_agent
    ctx.emit('agentStatus', msg.online_count, msg.has_online_agent)
  }
}
