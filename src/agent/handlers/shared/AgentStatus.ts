import type { AgentStatus } from '@/agent/types'
import type { MessageHandler } from '@/agent/handlers/context'

export class AgentStatusHandler implements MessageHandler<AgentStatus> {
  readonly type = 'agent_status'
  handle(msg: AgentStatus, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    ctx.emit('agentStatus', msg.online_count, msg.has_online_agent)
  }
}
