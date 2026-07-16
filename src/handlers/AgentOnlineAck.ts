/**
 * AgentOnlineAck 消息处理器
 *
 * 处理服务端返回的 agent_online 确认消息。
 * 服务端响应格式：{ type: "agent_online" }
 * 收到后标记 store.isAgentOnline = true，并拉取会话列表。
 */
import type { HandlerContext, MessageHandler } from '@/handlers/agentContext'
import type { ServerMessage } from '@/types'
import { store } from '@/store/agent'
import { getInstance } from '@/agentSdk'

export class AgentOnlineAckHandler implements MessageHandler<ServerMessage> {
  readonly type = 'agent_online'

  handle(_msg: ServerMessage, _ctx: HandlerContext): void {
    if (store.isAgentOnline) return
    store.isAgentOnline = true

    const sdk = getInstance()
    if (sdk) {
      sdk.requestSessionList(1, 50, 'active')
      sdk.requestWaitingSessionList()
    }
  }
}
