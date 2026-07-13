import type { SessionListRes } from '@/agent/types'
import type { HandlerContext, MessageHandler } from '@/agent/handlers/context'
import { store } from '@/agent/store/store'

export class SessionListResHandler implements MessageHandler<SessionListRes> {
  readonly type = 'session_list_res'
  handle(msg: SessionListRes, ctx: HandlerContext): void {
    if (!msg.items) return
    const items = msg.items.map(i => ({
      sessionId: i.session_id, visitorId: i.visitor_id, visitorNickname: i.visitor_nickname,
      visitorPhone: i.visitor_phone, visitorExternalId: i.visitor_external_id,
      agentId: i.agent_id, agentNickname: i.agent_nickname, status: i.status,
      source: i.source, ip: i.ip, country: i.country, province: i.province, city: i.city,
      userAgent: i.user_agent, platform: i.platform,
      lastMsgContent: i.last_msg_content, lastMsgTime: i.last_msg_time,
      unreadCount: i.unread_count, createdAt: i.created_at,
    }))
    if (msg.page <= 1) { store.sessions = items }
    else { store.sessions.push(...items) }
    store._hasMoreSessions = items.length >= msg.limit
    store._sessionPage = msg.page
    ctx.emit('sessionListUpdated')
  }
}
