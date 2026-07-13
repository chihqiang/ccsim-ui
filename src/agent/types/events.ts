export type SdkEventName =
  | 'allSet'
  | 'disconnected'
  | 'reconnecting'
  | 'reconnected'
  | 'error'
  | 'messageError'
  | 'newSession'
  | 'sessionAccepted'
  | 'sessionClosed'
  | 'sessionListUpdated'
  | 'waitingListUpdated'
  | 'agentStatus'
  | 'typingPush'
  | 'messageReadPush'
  | 'visitorInfoUpdated'

export interface SdkEvents {
  allSet: () => void
  disconnected: (code: number, reason: string) => void
  reconnecting: (attempt: number, maxAttempts: number) => void
  reconnected: () => void
  error: (error: Error) => void
  messageError: (error: string) => void
  newSession: (sessionId: number) => void
  sessionAccepted: (sessionId: number) => void
  sessionClosed: (sessionId: number) => void
  sessionListUpdated: () => void
  waitingListUpdated: () => void
  agentStatus: (onlineCount: number, hasOnlineAgent: boolean) => void
  typingPush: (sessionId: number, senderRole: string, senderId: number) => void
  messageReadPush: (sessionId: number, readerRole: string, readerId: number, msgId: number, seqNum: number) => void
  visitorInfoUpdated: (sessionId: number, visitorId: number, nickname?: string, phone?: string, avatar?: string) => void
}
