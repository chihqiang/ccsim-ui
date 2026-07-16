import type { AgentStatus } from '@/types'
import type { MessageHandler } from '@/handlers/agentContext'

export class AgentAgentStatusHandler implements MessageHandler<AgentStatus> {
  readonly type = 'agent_status'
  handle(msg: AgentStatus, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    ctx.emit('agentStatus', msg.online_count, msg.has_online_agent)
  }
}
