import type { ChatAck } from '@/visitor/types'
import type { HandlerContext, MessageHandler } from '@/visitor/handlers/context'
import { store } from '@/visitor/store/store'
import { cancelOptimisticTimer } from '@/visitor/messaging/send'

export class ChatAckHandler implements MessageHandler<ChatAck> {
  readonly type = 'chat_ack'
  handle(msg: ChatAck, ctx: HandlerContext): void {
    cancelOptimisticTimer(ctx._sendState, msg.temp_id)
    ctx.pipeline.resolveByAck(msg.temp_id, msg.msg_id, msg.session_id, msg.seq_num, msg.created_at, store.messages)
  }
}
