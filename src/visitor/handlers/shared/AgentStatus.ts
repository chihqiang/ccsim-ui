import type { AgentStatus } from '@/visitor/types'
import type { MessageHandler } from '@/visitor/handlers/context'
import { store } from '@/visitor/store/store'

export class AgentStatusHandler implements MessageHandler<AgentStatus> {
  readonly type = 'agent_status'
  handle(msg: AgentStatus, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    store.agentOnlineCount = msg.online_count
    store.hasOnlineAgent = msg.has_online_agent
    ctx.emit('agentStatus', msg.online_count, msg.has_online_agent)
  }
}
