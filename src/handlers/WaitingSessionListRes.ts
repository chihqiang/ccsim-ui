import type { WaitingSessionListRes } from '@/types'
import type { HandlerContext, MessageHandler } from '@/handlers/agentContext'
import { store } from '@/store/agent'

export class AgentWaitingSessionListResHandler implements MessageHandler<WaitingSessionListRes> {
  readonly type = 'waiting_session_list_res'
  handle(msg: WaitingSessionListRes, ctx: HandlerContext): void {
    store.waitingSessions = msg.items || []
    ctx.emit('waitingListUpdated')
  }
}
