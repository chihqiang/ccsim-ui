export { SDKStatusEnum } from '@/core/types/sdk'
export { LogLevel } from '@/core/types'
export type { VisitorInitOptions } from './options'

// 共享类型：全部从 core/types 再导出
export { ClientMessageTypeEnum } from '@/core/types/clientMessage'
export type {
  AuthMessage, HeartbeatMessage, ChatSendMessage,
  SatisfactionRateMessage, VisitorUpdateMessage,
  SessionCloseMessage, SessionHistoryMessage,
  TypingMessage, MessageReadMessage, ClientMessage,
} from '@/core/types/clientMessage'

export { ServerMessageTypeEnum } from '@/core/types/serverMessage'
export type {
  AuthOk, HeartbeatAck, ChatAck, ChatPush,
  OfflineMessageItem, OfflinePush, HistoryBatch,
  SessionCreated, SessionAssigned, SessionClosed,
  AgentStatus, AgentOnline, AgentOffline,
  TypingPush, MessageReadPush,
  SatisfactionRateRes, VisitorUpdateOk, ErrorMsg,
  ServerMessage,
} from '@/core/types/serverMessage'

export { MessageStatusEnum } from '@/core/types/store'
export type { ChatMessageItem } from '@/core/types/store'
export { SenderTypeEnum } from '@/core/types/sender-type'
export type { SdkEvents, SdkEventName } from './events'
