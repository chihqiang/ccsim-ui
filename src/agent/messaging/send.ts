/**
 * 消息发送模块
 */
import type { ChatMessageItem } from '@/core/types/store'
import type { ClientMessage } from '@/agent/types'
import { ClientMessageTypeEnum, SenderTypeEnum, MessageStatusEnum } from '@/agent/types'
import { validateMessage, sanitizeMessage } from '@/core/messaging/security'
import { OPTIMISTIC_TIMEOUT } from '@/core/utils/constants'
import { t } from '@/core/i18n'
import { v4 as uuidv4 } from 'uuid'
import type { MessagePipeline } from './pipeline'
import {
  createSendState, clearAllTimers, cancelOptimisticTimer,
  type SendState,
} from '@/core/messaging/send'

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
  _sendState: SendState
}

const MIN_SEND_INTERVAL = 500
const BASE_OPTIMISTIC_ITEM: ChatMessageItem = {
  msgId: 0, tempId: '', sessionId: 0, senderRole: '', senderId: 0,
  nickname: '', content: '', msgType: 'text', seqNum: 0, createdAt: 0,
  isRead: false, status: MessageStatusEnum.PENDING,
}

function createOptimisticItem(
  tempId: string, sessionId: number, senderRole: string, senderId: number,
  nickname: string, content: string, msgType: string, isRead: boolean,
): ChatMessageItem {
  return { ...BASE_OPTIMISTIC_ITEM, tempId, sessionId, senderRole, senderId, nickname, content, msgType, createdAt: Date.now(), isRead }
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

export function sendChat(ctx: SendChatContext, content: string, msgType = 'text') {
  const trimmed = content.trim()
  const validation = validateMessage(trimmed)
  if (!validation.valid) { ctx.emit('messageError', validation.error!); return }

  const state = ctx._sendState
  if (!state) return
  if (!checkRateLimit(state)) { ctx.emit('messageError', t('send.agentTooFrequent')); return }
  if (!ctx.connected) { ctx.emit('messageError', t('send.agentDisconnected')); return }

  const sanitized = sanitizeMessage(trimmed)
  const tempId = uuidv4()
  const sid = ctx.currentSessionId
  if (!sid) { ctx.emit('messageError', t('send.agentNoSession')); return }

  ctx.send({
    type: ClientMessageTypeEnum.CHAT_SEND,
    session_id: sid,
    content: sanitized,
    msg_type: msgType,
    temp_id: tempId,
  })
  state.lastSendTime = Date.now()

  const item = createOptimisticItem(
    tempId, sid, SenderTypeEnum.AGENT,
    ctx.agentId ?? 0, ctx.agentName ?? `客服${ctx.agentId ?? ''}`,
    sanitized, msgType, true,
  )
  ctx.optimisticMessages.push(item)
  ctx.pipeline.queue.push(item)
  scheduleTimeout(ctx, state, tempId)
}
