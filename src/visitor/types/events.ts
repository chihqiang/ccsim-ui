export type SdkEventName =
  | 'allSet'
  | 'disconnected'
  | 'reconnecting'
  | 'reconnected'
  | 'error'
  | 'messageError'
  | 'agentStatus'
  | 'startSession'
  | 'endSession'
  | 'sessionAssigned'
  | 'satisfactionRated'
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
  agentStatus: (onlineCount: number, hasOnlineAgent: boolean) => void
  startSession: (sessionId: number) => void
  endSession: (sessionId: number) => void
  sessionAssigned: (sessionId: number) => void
  satisfactionRated: (sessionId: number, status: string) => void
  typingPush: (sessionId: number, senderRole: string, senderId: number) => void
  messageReadPush: (sessionId: number, readerRole: string, readerId: number, msgId: number, seqNum: number) => void
  visitorInfoUpdated: (visitorId: number, nickname?: string, phone?: string, avatar?: string) => void
}
