import type { MessageHandler } from '@/agent/handlers/context'
import { AuthOkHandler } from './shared/AuthOk'
import { HeartbeatAckHandler } from '@/core/handlers/shared/HeartbeatAck'
import { SessionCloseAckHandler } from './shared/SessionCloseAck'
import { ChatAckHandler } from './shared/ChatAck'
import { ChatPushHandler } from './shared/ChatPush'
import { SessionCreatedHandler } from './shared/SessionCreated'
import { SessionAssignedHandler } from './shared/SessionAssigned'
import { SessionClosedHandler } from './shared/SessionClosed'
import { SessionListResHandler } from './shared/SessionListRes'
import { WaitingSessionListResHandler } from './shared/WaitingSessionListRes'
import { NewSessionHandler } from './shared/NewSession'
import { AgentStatusHandler } from './shared/AgentStatus'
import { OfflinePushHandler } from './shared/OfflinePush'
import { HistoryBatchHandler } from './shared/HistoryBatch'
import { ErrorHandler } from './shared/Error'
import { TypingPushHandler } from '@/core/handlers/shared/TypingPush'
import { MessageReadPushHandler } from '@/core/handlers/shared/MessageReadPush'
import { VisitorInfoUpdatedHandler } from './shared/VisitorInfoUpdated'
import { AgentOnlineAckHandler } from './shared/AgentOnlineAck'
import { AgentOfflineAckHandler } from './shared/AgentOfflineAck'
import { SessionAcceptAckHandler } from './shared/SessionAcceptAck'

const handlers: MessageHandler[] = [
  new AuthOkHandler(),
  new AgentOnlineAckHandler(),
  new AgentOfflineAckHandler(),
  new SessionAcceptAckHandler(),
  new SessionCloseAckHandler(),
  new HeartbeatAckHandler(),
  new ChatAckHandler(),
  new ChatPushHandler(),
  new SessionCreatedHandler(),
  new SessionAssignedHandler(),
  new SessionClosedHandler(),
  new SessionListResHandler(),
  new WaitingSessionListResHandler(),
  new NewSessionHandler(),
  new AgentStatusHandler(),
  new OfflinePushHandler(),
  new HistoryBatchHandler(),
  new ErrorHandler(),
  new TypingPushHandler(),
  new MessageReadPushHandler(),
  new VisitorInfoUpdatedHandler(),
]

export function registerHandlers(): Map<string, MessageHandler> {
  const map = new Map<string, MessageHandler>()
  for (const h of handlers) map.set(h.type, h)
  return map
}
