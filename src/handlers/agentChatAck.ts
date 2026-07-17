/**
 * ChatAck 消息处理器
 *
 * 收到服务端确认后将乐观消息从 PENDING 升级为 DELIVERED，
 * 同时同步写入 messagesMap 以避免消息在 UI 中消失。
 */
import type { ChatAck } from '@/types'
import type { HandlerContext, MessageHandler } from '@/handlers/agentContext'
import { store } from '@/store/agent'
import { cancelOptimisticTimer } from '@/messaging/coreSend'
import { registerSeenMsgId } from '@/utils/dedup'
import { logger } from '@/utils/logger'

export class AgentChatAckHandler implements MessageHandler<ChatAck> {
  readonly type = 'chat_ack'

  handle(msg: ChatAck, ctx: HandlerContext): void {
    cancelOptimisticTimer(ctx.sendState, msg.temp_id)
    if (msg.msg_id > 0) registerSeenMsgId(msg.msg_id)

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
