import type { MessageHandler } from '@/handlers/visitorContext'
import { VisitorAuthOkHandler } from './visitorAuthOk'
import { VisitorChatAckHandler } from './visitorChatAck'
import { VisitorChatPushHandler } from './visitorChatPush'
import { VisitorSessionCreatedHandler } from './visitorSessionCreated'
import { VisitorSessionAssignedHandler } from './visitorSessionAssigned'
import { VisitorSessionClosedHandler } from './visitorSessionClosed'
import { VisitorAgentStatusHandler } from './visitorAgentStatus'
import { VisitorOfflinePushHandler } from './visitorOfflinePush'
import { VisitorHistoryBatchHandler } from './visitorHistoryBatch'
import { VisitorUpdateOkHandler } from './visitorUpdateOk'
import { VisitorNewSessionHandler } from './visitorNewSession'
import { SatisfactionRateHandler } from '@/toolbar/satisfaction/satisfactionRate'
import { HeartbeatAckHandler } from './heartbeatAck'
import { ErrorHandler } from './error'
import { TypingPushHandler } from './typingPush'
import { MessageReadPushHandler } from './messageReadPush'

const handlers: MessageHandler[] = [
  new VisitorAuthOkHandler(),
  new HeartbeatAckHandler(),
  new VisitorChatAckHandler(),
  new VisitorChatPushHandler(),
  new VisitorSessionCreatedHandler(),
  new VisitorSessionAssignedHandler(),
  new VisitorSessionClosedHandler(),
  new VisitorAgentStatusHandler(),
  new VisitorOfflinePushHandler(),
  new VisitorHistoryBatchHandler(),
  new VisitorNewSessionHandler(),
  new ErrorHandler(),
  new SatisfactionRateHandler(),
  new TypingPushHandler(),
  new MessageReadPushHandler(),
  new VisitorUpdateOkHandler(),
]

export function registerHandlers(): Map<string, MessageHandler> {
  const map = new Map<string, MessageHandler>()
  for (const h of handlers) map.set(h.type, h)
  return map
}
