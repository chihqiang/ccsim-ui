/**
 * 消息发送模块
 */
import type { ChatMessageItem, MsgType } from '@/types/store'
import type { ClientMessage } from '@/types'
import { ClientMessageTypeEnum, SenderTypeEnum, MessageStatusEnum } from '@/types'
import { validateMessage, sanitizeMessage } from '@/messaging/security'
import { OPTIMISTIC_TIMEOUT } from '@/types/sdk'
import { t } from '@/i18n'
import { v4 as uuidv4 } from 'uuid'
import type { MessagePipeline } from './agentPipeline'
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
  readonly agentName?: string
  readonly agentId?: number | null
  readonly currentSessionId?: number | null
  readonly pipeline: MessagePipeline
  readonly messages: ChatMessageItem[]
  readonly optimisticMessages: ChatMessageItem[]
  sendState: SendState
}

const MIN_SEND_INTERVAL = 500
const BASE_OPTIMISTIC_ITEM: ChatMessageItem = {
  msgId: 0,
  tempId: '',
  sessionId: 0,
  senderRole: SenderTypeEnum.AGENT,
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
  ctx.pipeline.markFailed(tempId, undefined, ctx.optimisticMessages)
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
    ctx.emit('messageError', validation.error!)
    return
  }

  const state = ctx.sendState
  if (!state) return
  if (!checkRateLimit(state)) {
    ctx.emit('messageError', t('send.agentTooFrequent'))
    return
  }
  if (!ctx.connected) {
    ctx.emit('messageError', t('send.agentDisconnected'))
    return
  }

  const sanitized = sanitizeMessage(trimmed)
  const tempId = uuidv4()
  const sid = ctx.currentSessionId
  if (!sid) {
    ctx.emit('messageError', t('send.agentNoSession'))
    return
  }

  ctx.send({
    type: ClientMessageTypeEnum.CHAT_SEND,
    session_id: sid,
    content: sanitized,
    msg_type: msgType,
    temp_id: tempId,
  })
  state.lastSendTime = Date.now()

  const item = createOptimisticItem(
    tempId,
    sid,
    SenderTypeEnum.AGENT,
    ctx.agentId ?? 0,
    ctx.agentName ?? `客服${ctx.agentId ?? ''}`,
    sanitized,
    msgType,
    true,
  )
  ctx.optimisticMessages.push(item)
  ctx.pipeline.queue.push(item)
  scheduleTimeout(ctx, state, tempId)
}
