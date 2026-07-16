/**
 * 消息构造工具
 *
 * 统一将 snake_case 的 serverMessage 转换为 camelCase 的 ChatMessageItem / SessionListItem
 */
import type { OfflineMessageItem } from '@/types/serverMessage'
import type { ChatMessageItem } from '@/types/store'
import { MessageStatusEnum } from '@/types/store'
import type { Role, SenderTypeEnum } from '@/types/sdk'

/**
 * 从 OfflineMessageItem / ChatPush 构建 ChatMessageItem
 * 注意：服务端已对消息内容做过清理，这里不再重复调用 sanitizeMessage
 */
export function toChatMessageItem(
  m: OfflineMessageItem,
  opts: { isRead?: boolean; status?: MessageStatusEnum } = {},
): ChatMessageItem {
  return {
    msgId: m.msg_id,
    tempId: '',
    sessionId: m.session_id,
    senderRole: m.sender_role as Role | SenderTypeEnum,
    senderId: m.sender_id,
    nickname: m.nickname,
    content: m.content,
    msgType: m.msg_type || 'text',
    seqNum: m.seq_num,
    createdAt: m.created_at,
    isRead: opts.isRead ?? false,
    status: opts.status ?? MessageStatusEnum.DELIVERED,
  }
}
