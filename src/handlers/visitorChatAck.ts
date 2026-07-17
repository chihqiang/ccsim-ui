import type { ChatAck } from '@/types'
import type { HandlerContext, MessageHandler } from '@/handlers/visitorContext'
import { store } from '@/store/visitor'
import { cancelOptimisticTimer } from '@/messaging/coreSend'
import { registerSeenMsgId } from '@/utils/dedup'

export class VisitorChatAckHandler implements MessageHandler<ChatAck> {
  readonly type = 'chat_ack'
  handle(msg: ChatAck, ctx: HandlerContext): void {
    cancelOptimisticTimer(ctx.sendState, msg.temp_id)
    if (msg.msg_id > 0) registerSeenMsgId(msg.msg_id)
    ctx.pipeline.resolveByAck(
      msg.temp_id,
      msg.msg_id,
      msg.session_id,
      msg.seq_num,
      msg.created_at,
      store.messages,
    )
  }
}
