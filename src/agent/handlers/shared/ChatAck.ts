/**
 * ChatAck 消息处理器
 *
 * 收到服务端确认后将乐观消息从 PENDING 升级为 DELIVERED，
 * 同时同步写入 messagesMap 以避免消息在 UI 中消失。
 */
import type { ChatAck } from '@/agent/types'
import type { HandlerContext, MessageHandler } from '@/agent/handlers/context'
import { store } from '@/agent/store/store'
import { cancelOptimisticTimer } from '@/agent/messaging/send'
import { logger } from '@/core/utils/logger'

export class ChatAckHandler implements MessageHandler<ChatAck> {
  readonly type = 'chat_ack'

  handle(msg: ChatAck, ctx: HandlerContext): void {
    // 取消超时计时器
    cancelOptimisticTimer(ctx._sendState, msg.temp_id)

    // 解析乐观消息并同步写入 messagesMap
    const resolved = ctx.pipeline.resolveByAck(
      msg.temp_id,
      msg.msg_id,
      msg.session_id,
      msg.seq_num,
      msg.created_at,
      store.messagesMap[msg.session_id] || [],
      store.optimisticMessages,
      store.messagesMap,
    )

    if (resolved) {
      logger.debug('ChatAck: resolved optimistic message', msg.temp_id, '→', msg.msg_id)
    } else {
      logger.debug('ChatAck: no matching optimistic message for', msg.temp_id)
    }
  }
}
