export enum ClientMessageTypeEnum {
  AUTH = 'auth',
  HEARTBEAT = 'heartbeat',
  CHAT_SEND = 'chat_send',
  AGENT_ONLINE = 'agent_online',
  AGENT_OFFLINE = 'agent_offline',
  SESSION_ACCEPT = 'session_accept',
  SESSION_CLOSE = 'session_close',
  SESSION_LIST = 'session_list',
  SESSION_HISTORY = 'session_history',
  WAITING_SESSION_LIST = 'waiting_session_list',
  SATISFACTION_RATE = 'satisfaction_rate',
  USER_UPDATE = 'visitor_update',
  TYPING = 'typing',
  MESSAGE_READ = 'message_read',
}

export interface AuthMessage {
  type: ClientMessageTypeEnum.AUTH
  tenant_no: string
  role: string
  /** visitor auth fields */
  external_visitor_id?: string
  nickname?: string
  phone?: string
  platform?: string
  /** agent auth fields */
  agent_account?: string
  agent_password?: string
}

export interface HeartbeatMessage {
  type: ClientMessageTypeEnum.HEARTBEAT
}

export interface ChatSendMessage {
  type: ClientMessageTypeEnum.CHAT_SEND
  session_id: number
  content: string
  msg_type?: string
  temp_id: string
}

export interface AgentOnlineMessage {
  type: ClientMessageTypeEnum.AGENT_ONLINE
}

export interface AgentOfflineMessage {
  type: ClientMessageTypeEnum.AGENT_OFFLINE
}

export interface SessionAcceptMessage {
  type: ClientMessageTypeEnum.SESSION_ACCEPT
  session_id: number
}

export interface SessionCloseMessage {
  type: ClientMessageTypeEnum.SESSION_CLOSE
  session_id: number
}

export interface SessionListMessage {
  type: ClientMessageTypeEnum.SESSION_LIST
  page: number
  limit: number
  status?: string
}

export interface SessionHistoryMessage {
  type: ClientMessageTypeEnum.SESSION_HISTORY
  session_id: number
  before_seq?: number
  limit?: number
}

export interface WaitingSessionListMessage {
  type: ClientMessageTypeEnum.WAITING_SESSION_LIST
}

export interface TypingMessage {
  type: ClientMessageTypeEnum.TYPING
  session_id: number
}

export interface MessageReadMessage {
  type: ClientMessageTypeEnum.MESSAGE_READ
  session_id: number
  msg_id: number
  seq_num: number
}

export interface SatisfactionRateMessage {
  type: ClientMessageTypeEnum.SATISFACTION_RATE
  session_id: number
  rating: number
}

export interface VisitorUpdateMessage {
  type: ClientMessageTypeEnum.USER_UPDATE
  nickname?: string
  phone?: string
  avatar?: string
  metadata?: string
}

export type ClientMessage =
  | AuthMessage
  | HeartbeatMessage
  | ChatSendMessage
  | AgentOnlineMessage
  | AgentOfflineMessage
  | SessionAcceptMessage
  | SessionCloseMessage
  | SessionListMessage
  | SessionHistoryMessage
  | WaitingSessionListMessage
  | SatisfactionRateMessage
  | VisitorUpdateMessage
  | TypingMessage
  | MessageReadMessage
