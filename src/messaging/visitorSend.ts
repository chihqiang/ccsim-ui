import type { ChatMessageItem, MsgType } from '@/types/store'
import type { ClientMessage } from '@/types'
import { ClientMessageTypeEnum, SenderTypeEnum, MessageStatusEnum } from '@/types'
import { logger } from '@/utils/logger'
import { t } from '@/i18n'
import { validateMessage, sanitizeMessage } from '@/messaging/security'
import { OPTIMISTIC_TIMEOUT } from '@/types/sdk'
import { v4 as uuidv4 } from 'uuid'
import type { MessagePipeline } from './visitorPipeline'
import {
  createSendState,
  clearAllTimers,
  cancelOptimisticTimer,
  type SendState,
} from '@/messaging/coreSend'

export { createSendState, clearAllTimers, cancelOptimisticTimer }
export type { SendState }

export interface SendChatContext {
  send(msg: ClientMessage): void
  emit(event: string, ...args: unknown[]): void
  get connected(): boolean
  readonly visitorOptions?: { nickname?: string }
  readonly visitorId?: number | null
  readonly sessionId?: number | null
  readonly pipeline: MessagePipeline
  readonly messages: ChatMessageItem[]
  sendState: SendState
}

const MIN_SEND_INTERVAL = 500
const BASE_OPTIMISTIC_ITEM: ChatMessageItem = {
  msgId: 0,
  tempId: '',
  sessionId: 0,
  senderRole: SenderTypeEnum.VISITOR,
  senderId: 0,
  nickname: '',
  content: '',
  msgType: 'text',
  seqNum: 0,
  createdAt: 0,
  isRead: false,
  status: MessageStatusEnum.PENDING,
}

function createOptimisticItem(
  tempId: string,
  sessionId: number,
  senderRole: SenderTypeEnum,
  senderId: number,
  nickname: string,
  content: string,
  msgType: MsgType,
  isRead: boolean,
): ChatMessageItem {
  return {
    ...BASE_OPTIMISTIC_ITEM,
    tempId,
    sessionId,
    senderRole,
    senderId,
    nickname,
    content,
    msgType,
    createdAt: Date.now(),
    isRead,
  }
}

function onOptimisticTimeout(ctx: SendChatContext, state: SendState, tempId: string) {
  state.tempIdToTimer.delete(tempId)
  const item = ctx.pipeline.queue.findByTempId(tempId)
  if (!item) return
  ctx.pipeline.markFailed(tempId, ctx.messages)
  ctx.emit('messageError', t('send.timeout'))
}

function scheduleTimeout(ctx: SendChatContext, state: SendState, tempId: string) {
  const timer = setTimeout(onOptimisticTimeout, OPTIMISTIC_TIMEOUT, ctx, state, tempId)
  state.tempIdToTimer.set(tempId, timer)
}

function checkRateLimit(state: SendState): boolean {
  const now = Date.now()
  if (now - state.lastSendTime < MIN_SEND_INTERVAL) return false
  return true
}

export function sendChat(ctx: SendChatContext, content: string, msgType: MsgType = 'text') {
  const trimmed = content.trim()
  const validation = validateMessage(trimmed)
  if (!validation.valid) {
    logger.warn(`消息验证失败: ${validation.error}`)
    ctx.emit('messageError', validation.error!)
    return
  }

  const state = ctx.sendState
  if (!state) return
  if (!checkRateLimit(state)) {
    logger.warn('消息发送过于频繁，已限流')
    ctx.emit('messageError', t('send.tooFrequent'))
    return
  }
  if (!ctx.connected) {
    const err = t('send.disconnected')
    logger.warn(err)
    ctx.emit('messageError', err)
    return
  }

  const cid = ctx.sessionId ?? 0

  const sanitized = sanitizeMessage(trimmed)
  const tempId = uuidv4()

  ctx.send({
    type: ClientMessageTypeEnum.CHAT_SEND,
    session_id: cid,
    content: sanitized,
    msg_type: msgType,
    temp_id: tempId,
  })
  state.lastSendTime = Date.now()

  const item = createOptimisticItem(
    tempId,
    cid,
    SenderTypeEnum.VISITOR,
    ctx.visitorId ?? 0,
    ctx.visitorOptions?.nickname ?? '',
    sanitized,
    msgType,
    false,
  )
  ctx.messages.push(item)
  ctx.pipeline.queue.push(item)
  scheduleTimeout(ctx, state, tempId)
}
