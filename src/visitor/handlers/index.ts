import type { MessageHandler } from '@/visitor/handlers/context'
import { AuthOkHandler } from './shared/AuthOk'
import { HeartbeatAckHandler } from '@/core/handlers/shared/HeartbeatAck'
import { ChatAckHandler } from './shared/ChatAck'
import { ChatPushHandler } from './shared/ChatPush'
import { SessionCreatedHandler } from './shared/SessionCreated'
import { SessionAssignedHandler } from './shared/SessionAssigned'
import { SessionClosedHandler } from './shared/SessionClosed'
import { AgentStatusHandler } from './shared/AgentStatus'
import { OfflinePushHandler } from './shared/OfflinePush'
import { HistoryBatchHandler } from './shared/HistoryBatch'
import { ErrorHandler } from './shared/Error'
import { SatisfactionRateHandler } from './shared/SatisfactionRate'
import { TypingPushHandler } from '@/core/handlers/shared/TypingPush'
import { MessageReadPushHandler } from '@/core/handlers/shared/MessageReadPush'
import { VisitorUpdateOkHandler } from './shared/VisitorUpdateOk'

const handlers: MessageHandler[] = [
  new AuthOkHandler(),
  new HeartbeatAckHandler(),
  new ChatAckHandler(),
  new ChatPushHandler(),
  new SessionCreatedHandler(),
  new SessionAssignedHandler(),
  new SessionClosedHandler(),
  new AgentStatusHandler(),
  new OfflinePushHandler(),
  new HistoryBatchHandler(),
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
