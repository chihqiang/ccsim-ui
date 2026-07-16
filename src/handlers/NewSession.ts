/**
 * NewSession 消息处理器
 *
 * 新访客会话进入等待队列：
 * 1. 去重检查：若 session_id 已存在于 waitingSessions 则跳过
 * 2. 前插到 waitingSessions
 * 3. 触发 newSession 事件
 */
import type { NewSession } from '@/types'
import type { HandlerContext, MessageHandler } from '@/handlers/agentContext'
import { store } from '@/store/agent'
import { logger } from '@/utils/logger'

export class NewSessionHandler implements MessageHandler<NewSession> {
  readonly type = 'new_session'

  handle(msg: NewSession, ctx: HandlerContext): void {
    // 去重：检查 session_id 是否已存在于 waitingSessions
    const exists = store.waitingSessions.some(w => w.session_id === msg.session_id)
    if (exists) {
      logger.debug('NewSession: duplicate session_id', msg.session_id, 'skipped')
      return
    }

    store.waitingSessions.unshift({
      session_id: msg.session_id,
      visitor_id: msg.visitor_id,
      visitor_nickname: msg.visitor_nickname,
      visitor_phone: msg.visitor_phone || '',
      visitor_external_id: msg.visitor_external_id || '',
      visitor_avatar: '',
      source: msg.source || 'web',
      ip: msg.ip || '',
      platform: msg.platform || '',
      last_msg_content: msg.last_msg_content,
      created_at: msg.created_at,
      waiting_seconds: 0,
    })

    logger.debug('NewSession: added session', msg.session_id, 'to waiting queue')
    ctx.emit('newSession', msg.session_id)
  }
}
