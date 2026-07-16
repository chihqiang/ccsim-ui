import type { HandlerContext, MessageHandler } from '@/handlers/agentContext'
import type { SessionAcceptAck } from '@/types/serverMessage'
import { store } from '@/store/agent'
import { logger } from '@/utils/logger'

export class AgentSessionAcceptAckHandler implements MessageHandler<SessionAcceptAck> {
  readonly type = 'session_accept'

  handle(msg: SessionAcceptAck, ctx: HandlerContext): void {
    const sid = msg.session_id
    if (!sid) return

    store.currentSessionId = sid

    if (store.sessions.some((s) => s.sessionId === sid)) return

    const waiting = store.waitingSessions.find((w) => w.session_id === sid)
    if (waiting) {
      store.sessions.unshift({
        sessionId: sid,
        visitorId: waiting.visitor_id,
        visitorNickname: waiting.visitor_nickname,
        agentId: store.agentId ?? 0,
        agentNickname: store.agentName,
        status: 'active',
        lastMsgContent: waiting.last_msg_content,
        lastMsgTime: waiting.created_at,
        unreadCount: 0,
        createdAt: waiting.created_at,
      })
      const wIdx = store.waitingSessions.findIndex((w) => w.session_id === sid)
      if (wIdx !== -1) store.waitingSessions.splice(wIdx, 1)
      logger.info('SessionAcceptAck: session', sid, 'accepted, moved to active')
    }

    if (!store.messagesMap[sid]?.length) {
      store.historyLoading[sid] = true
      ctx.requestSessionHistory(sid)
    }

    ctx.emit('sessionAccepted', sid)
  }
}
