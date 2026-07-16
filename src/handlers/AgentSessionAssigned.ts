/**
 * SessionAssigned 消息处理器
 *
 * 会话被分配给当前客服时：
 * 1. 设置 currentSessionId
 * 2. 在 sessions 列表中查找并更新（状态 → active、agentId、agentNickname）
 * 3. 若 sessions 中不存在则从 waitingSessions 构建并插入
 * 4. 从 waitingSessions 中移除
 * 5. 若尚无历史消息则自动拉取
 * 6. 触发 sessionAccepted 事件
 */
import type { SessionAssigned } from '@/types'
import type { HandlerContext, MessageHandler } from '@/handlers/agentContext'
import { store } from '@/store/agent'
import { logger } from '@/utils/logger'

export class AgentSessionAssignedHandler implements MessageHandler<SessionAssigned> {
  readonly type = 'session_assigned'

  handle(msg: SessionAssigned, ctx: HandlerContext): void {
    const sid = msg.session_id

    logger.info('SessionAssigned: session', sid, 'assigned to agent', msg.agent_id)

    // 其他客服接入的会话：仅从 waitingSessions 中移除，不做完整处理
    if (store.agentId != null && msg.agent_id !== store.agentId) {
      const wIdx = store.waitingSessions.findIndex(w => w.session_id === sid)
      if (wIdx !== -1) {
        store.waitingSessions.splice(wIdx, 1)
        logger.info('SessionAssigned: session', sid, 'removed from waiting (accepted by another agent)')
      }
      return
    }

    // 1. 设置当前选中的会话
    store.currentSessionId = sid

    // 2. 在 sessions 列表中查找并更新
    let session = store.sessions.find(s => s.sessionId === sid)

    if (session) {
      session.status = 'active'
      session.agentId = msg.agent_id
      session.agentNickname = msg.agent_nickname
    } else {
      // 3. 从 waitingSessions 构建新的 session 条目
      const waiting = store.waitingSessions.find(w => w.session_id === sid)
      if (waiting) {
        store.sessions.unshift({
          sessionId: sid,
          visitorId: waiting.visitor_id,
          visitorNickname: waiting.visitor_nickname,
          agentId: msg.agent_id,
          agentNickname: msg.agent_nickname,
          status: 'active',
          lastMsgContent: waiting.last_msg_content,
          lastMsgTime: waiting.created_at,
          unreadCount: 0,
          createdAt: waiting.created_at,
        })
        session = store.sessions[0]
      } else {
        store.sessions.unshift({
          sessionId: sid,
          visitorId: 0,
          visitorNickname: '',
          agentId: msg.agent_id,
          agentNickname: msg.agent_nickname,
          status: 'active',
          lastMsgContent: '',
          lastMsgTime: Date.now(),
          unreadCount: 0,
          createdAt: Date.now(),
        })
        session = store.sessions[0]
      }
    }

    // 4. 从 waitingSessions 中移除
    const wIdx = store.waitingSessions.findIndex(w => w.session_id === sid)
    if (wIdx !== -1) {
      store.waitingSessions.splice(wIdx, 1)
    }

    // 5. 自动拉取历史消息（仅当该会话尚无消息时）
    if (!store.messagesMap[sid]?.length) {
      logger.debug('SessionAssigned: auto-requesting history for session', sid)
      store.historyLoading[sid] = true
      ctx.requestSessionHistory(sid)
    }

    // 6. 触发事件
    ctx.emit('sessionAccepted', sid)
  }
}
