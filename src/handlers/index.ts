import type { MessageHandler } from '@/handlers/agentContext'
import { AgentAuthOkHandler } from './agentAuthOk'
import { AgentOnlineAckHandler } from './agentOnlineAck'
import { AgentOfflineAckHandler } from './agentOfflineAck'
import { AgentSessionAcceptAckHandler } from './sessionAcceptAck'
import { AgentSessionCloseAckHandler } from './sessionCloseAck'
import { AgentChatAckHandler } from './agentChatAck'
import { AgentChatPushHandler } from './agentChatPush'
import { AgentSessionCreatedHandler } from './agentSessionCreated'
import { AgentSessionAssignedHandler } from './agentSessionAssigned'
import { AgentSessionClosedHandler } from './agentSessionClosed'
import { AgentSessionListResHandler } from './sessionListRes'
import { AgentWaitingSessionListResHandler } from './waitingSessionListRes'
import { NewSessionHandler } from './newSession'
import { AgentAgentStatusHandler } from './agentAgentStatus'
import { AgentOfflinePushHandler } from './agentOfflinePush'
import { AgentHistoryBatchHandler } from './agentHistoryBatch'
import { VisitorInfoUpdatedHandler } from './visitorInfoUpdated'
import { HeartbeatAckHandler } from './heartbeatAck'
import { ErrorHandler } from './error'
import { TypingPushHandler } from './typingPush'
import { MessageReadPushHandler } from './messageReadPush'

const handlers: MessageHandler[] = [
  new AgentAuthOkHandler(),
  new AgentOnlineAckHandler(),
  new AgentOfflineAckHandler(),
  new AgentSessionAcceptAckHandler(),
  new AgentSessionCloseAckHandler(),
  new HeartbeatAckHandler(),
  new AgentChatAckHandler(),
  new AgentChatPushHandler(),
  new AgentSessionCreatedHandler(),
  new AgentSessionAssignedHandler(),
  new AgentSessionClosedHandler(),
  new AgentSessionListResHandler(),
  new AgentWaitingSessionListResHandler(),
  new NewSessionHandler(),
  new AgentAgentStatusHandler(),
  new AgentOfflinePushHandler(),
  new AgentHistoryBatchHandler(),
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
