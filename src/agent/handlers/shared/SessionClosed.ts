/**
 * SessionClosed 消息处理器
 *
 * 会话关闭时：
 * 1. 从 sessions 列表中移除
 * 2. 若关闭的是当前选中会话，清除 currentSessionId
 * 3. 清理 messagesMap[session_id] 释放内存
 * 4. 清理 optimisticMessages 中该会话的乐观消息
 * 5. 触发 sessionClosed 事件
 */
import type { SessionClosed } from '@/agent/types'
import type { HandlerContext, MessageHandler } from '@/agent/handlers/context'
import { store } from '@/agent/store/store'
import { logger } from '@/core/utils/logger'
import { cancelOptimisticTimer } from '@/agent/messaging/send'

export class SessionClosedHandler implements MessageHandler<SessionClosed> {
  readonly type = 'session_closed'

  handle(msg: SessionClosed, ctx: HandlerContext): void {
    const sid = msg.session_id

    logger.info('SessionClosed: session', sid, 'closed, reason:', msg.close_reason)

    // 1. 从 sessions 列表中移除
    const idx = store.sessions.findIndex(s => s.sessionId === sid)
    if (idx !== -1) {
      store.sessions.splice(idx, 1)
    }

    // 同时从 waitingSessions 中移除（可能尚未被接入就被关闭）
    const wIdx = store.waitingSessions.findIndex(w => w.session_id === sid)
    if (wIdx !== -1) {
      store.waitingSessions.splice(wIdx, 1)
    }

    // 2. 清除 currentSessionId
    if (store.currentSessionId === sid) {
      store.currentSessionId = null
    }

    // 3. 清理 messagesMap 释放内存
    if (store.messagesMap[sid]) {
      delete store.messagesMap[sid]
    }

    // 4. 清理 optimisticMessages 中属于该会话的乐观消息，并取消超时定时器
    for (let i = store.optimisticMessages.length - 1; i >= 0; i--) {
      if (store.optimisticMessages[i].sessionId === sid) {
        cancelOptimisticTimer(ctx._sendState, store.optimisticMessages[i].tempId)
        store.optimisticMessages.splice(i, 1)
      }
    }

    // 同时清理 pipeline 队列中该会话的乐观消息
    ctx.pipeline.queue.removeBySessionId(sid)

    // 5. 触发事件
    ctx.emit('sessionClosed', sid)
  }
}
