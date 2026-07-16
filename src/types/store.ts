import type { Role, SenderTypeEnum } from './sdk'

export enum MessageStatusEnum {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export type MsgType = 'text' | 'image' | 'video' | 'audio' | 'file'
export type SessionStatus = 'waiting' | 'active' | 'closed'

export interface ChatMessageItem {
  msgId: number
  tempId: string
  sessionId: number
  senderRole: Role | SenderTypeEnum
  senderId: number
  nickname: string
  content: string
  msgType: string
  seqNum: number
  createdAt: number
  isRead: boolean
  status: MessageStatusEnum
  avatar?: string
}

export interface SessionListItem {
  sessionId: number
  visitorId: number
  visitorNickname: string
  visitorPhone?: string
  visitorExternalId?: string
  visitorAvatar?: string
  agentId: number
  agentNickname: string
  status: SessionStatus
  source?: string
  ip?: string
  country?: string
  province?: string
  city?: string
  userAgent?: string
  platform?: string
  lastMsgContent: string
  lastMsgTime: number
  unreadCount: number
  createdAt: number
  waitingSeconds?: number
}
