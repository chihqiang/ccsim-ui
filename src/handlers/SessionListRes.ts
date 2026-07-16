import type { SessionListRes } from '@/types'
import type { SessionStatus } from '@/types/store'
import type { HandlerContext, MessageHandler } from '@/handlers/agentContext'
import { store } from '@/store/agent'

export class AgentSessionListResHandler implements MessageHandler<SessionListRes> {
  readonly type = 'session_list_res'
  handle(msg: SessionListRes, ctx: HandlerContext): void {
    if (!msg.items) return
    const items = msg.items.map(i => ({
      sessionId: i.session_id, visitorId: i.visitor_id, visitorNickname: i.visitor_nickname,
      visitorPhone: i.visitor_phone, visitorExternalId: i.visitor_external_id,
      agentId: i.agent_id, agentNickname: i.agent_nickname, status: i.status as SessionStatus,
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
