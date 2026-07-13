import type { WaitingSessionListRes } from '@/agent/types'
import type { HandlerContext, MessageHandler } from '@/agent/handlers/context'
import { store } from '@/agent/store/store'

export class WaitingSessionListResHandler implements MessageHandler<WaitingSessionListRes> {
  readonly type = 'waiting_session_list_res'
  handle(msg: WaitingSessionListRes, ctx: HandlerContext): void {
    store.waitingSessions = msg.items || []
    ctx.emit('waitingListUpdated')
  }
}
