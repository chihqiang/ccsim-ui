export enum ServerMessageTypeEnum {
  AUTH_OK = 'auth_ok',
  HEARTBEAT_ACK = 'heartbeat_ack',
  CHAT_ACK = 'chat_ack',
  CHAT_PUSH = 'chat_push',
  OFFLINE_PUSH = 'offline_push',
  HISTORY_BATCH = 'history_batch',
  SESSION_CREATED = 'session_created',
  SESSION_ASSIGNED = 'session_assigned',
  SESSION_CLOSED = 'session_closed',
  SESSION_LIST_RES = 'session_list_res',
  WAITING_SESSION_LIST_RES = 'waiting_session_list_res',
  NEW_SESSION = 'new_session',
  AGENT_STATUS = 'agent_status',
  AGENT_ONLINE = 'agent_online',
  AGENT_OFFLINE = 'agent_offline',
  TYPING_PUSH = 'typing_push',
  MESSAGE_READ_PUSH = 'message_read_push',
  ERROR = 'error',
  VISITOR_INFO_UPDATED = 'visitor_info_updated',
  SATISFACTION_RATE = 'satisfaction_rate',
  VISITOR_UPDATE_OK = 'visitor_update_ok',
}

export interface AuthOk {
  type: ServerMessageTypeEnum.AUTH_OK
  conn_id: string
  agent_id?: number
  visitor_id?: number
}

export interface HeartbeatAck {
  type: ServerMessageTypeEnum.HEARTBEAT_ACK
}

export interface ChatAck {
  type: ServerMessageTypeEnum.CHAT_ACK
  temp_id: string
  msg_id: number
  session_id: number
  seq_num: number
  created_at: number
}

export interface ChatPush {
  type: ServerMessageTypeEnum.CHAT_PUSH
  msg_id: number
  session_id: number
  sender_role: string
  sender_id: number
  nickname: string
  content: string
  msg_type: string
  seq_num: number
  created_at: number
}

export interface OfflineMessageItem {
  msg_id: number
  session_id: number
  sender_role: string
  sender_id: number
  nickname: string
  content: string
  msg_type: string
  seq_num: number
  created_at: number
}

export interface OfflinePush {
  type: ServerMessageTypeEnum.OFFLINE_PUSH
  messages: OfflineMessageItem[] | null
}

export interface HistoryBatch {
  type: ServerMessageTypeEnum.HISTORY_BATCH
  session_id: number
  count?: number
  data: OfflineMessageItem[] | null
}

export interface SessionCreated {
  type: ServerMessageTypeEnum.SESSION_CREATED
  session_id: number
  status: string
  created_at: number
}

export interface SessionAssigned {
  type: ServerMessageTypeEnum.SESSION_ASSIGNED
  session_id: number
  agent_id: number
  agent_nickname: string
  agent_avatar: string
}

export interface SessionClosed {
  type: ServerMessageTypeEnum.SESSION_CLOSED
  session_id: number
  close_reason: string
}

export interface ServerSessionListItem {
  session_id: number
  visitor_id: number
  visitor_nickname: string
  visitor_phone?: string
  visitor_external_id?: string
  agent_id: number
  agent_nickname: string
  status: string
  source?: string
  ip?: string
  country?: string
  province?: string
  city?: string
  user_agent?: string
  platform?: string
  last_msg_content: string
  last_msg_time: number
  unread_count: number
  created_at: number
}

export interface SessionListRes {
  type: ServerMessageTypeEnum.SESSION_LIST_RES
  items: ServerSessionListItem[] | null
  total: number
  page: number
  limit: number
}

export interface WaitingSessionListItem {
  session_id: number
  visitor_id: number
  visitor_nickname: string
  visitor_avatar: string
  visitor_phone?: string
  visitor_external_id?: string
  source: string
  ip?: string
  country?: string
  province?: string
  city?: string
  user_agent?: string
  platform?: string
  last_msg_content: string
  created_at: number
  waiting_seconds: number
}

export interface WaitingSessionListRes {
  type: ServerMessageTypeEnum.WAITING_SESSION_LIST_RES
  items: WaitingSessionListItem[] | null
}

export interface NewSession {
  type: ServerMessageTypeEnum.NEW_SESSION
  session_id: number
  visitor_id: number
  visitor_nickname: string
  visitor_phone?: string
  visitor_external_id?: string
  source?: string
  ip?: string
  platform?: string
  last_msg_content: string
  created_at: number
}

export interface AgentStatus {
  type: ServerMessageTypeEnum.AGENT_STATUS
  online_count: number
  has_online_agent: boolean
}

export interface AgentOnline {
  type: ServerMessageTypeEnum.AGENT_ONLINE
  agent_id: number
  status: string
}

export interface AgentOffline {
  type: ServerMessageTypeEnum.AGENT_OFFLINE
  agent_id: number
  status: string
}

export interface TypingPush {
  type: ServerMessageTypeEnum.TYPING_PUSH
  session_id: number
  sender_role: string
  sender_id: number
}

export interface MessageReadPush {
  type: ServerMessageTypeEnum.MESSAGE_READ_PUSH
  session_id: number
  reader_role: string
  reader_id: number
  msg_id: number
  seq_num: number
}

export interface VisitorInfoUpdated {
  type: ServerMessageTypeEnum.VISITOR_INFO_UPDATED
  session_id: number
  visitor_id: number
  nickname?: string
  phone?: string
  avatar?: string
}

export interface SatisfactionRateRes {
  type: ServerMessageTypeEnum.SATISFACTION_RATE
  session_id: number
  status: string
}

export interface VisitorUpdateOk {
  type: ServerMessageTypeEnum.VISITOR_UPDATE_OK
}

export interface SessionAcceptAck {
  type: 'session_accept'
  session_id: number
  status: string
}

export interface SessionCloseAck {
  type: 'session_close'
  session_id: number
  close_reason: string
}

export interface ErrorMsg {
  type: ServerMessageTypeEnum.ERROR
  code: string
  err_msg?: string
  message?: string
}

export type ServerMessage =
  | AuthOk
  | HeartbeatAck
  | ChatAck
  | ChatPush
  | OfflinePush
  | HistoryBatch
  | SessionCreated
  | SessionAssigned
  | SessionClosed
  | SessionListRes
  | WaitingSessionListRes
  | NewSession
  | AgentStatus
  | AgentOnline
  | AgentOffline
  | TypingPush
  | MessageReadPush
  | VisitorInfoUpdated
  | SatisfactionRateRes
  | SessionAcceptAck
  | SessionCloseAck
  | VisitorUpdateOk
  | ErrorMsg
