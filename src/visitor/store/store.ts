import { reactive } from 'vue'
import type { ChatMessageItem } from '@/core/types/store'
import { SDKStatusEnum } from '@/core/types/sdk'
import { clearSeenMsgIds } from '@/core/utils/dedup'

export interface VisitorStoreState {
  status: SDKStatusEnum
  connId: string | null
  panelVisible: boolean
  widgetVisible: boolean
  visitorId: number | null
  agentOnlineCount: number
  hasOnlineAgent: boolean
  sessionId: number | null
  messages: ChatMessageItem[]
  _hasMoreHistory: boolean
  /** 对方正在输入 */
  agentTyping: boolean
  /** 未读消息数 */
  unreadCount: number
  /** 历史消息加载中 */
  historyLoading: boolean
  /** 主动评价卡片是否显示（会话关闭后自动弹出） */
  showRateCard: boolean
  /** 待评价的会话 ID（sessionId 被清空后保留） */
  rateCardSessionId: number | null
}

function createInitialState(): VisitorStoreState {
  return {
    status: SDKStatusEnum.DISCONNECTED,
    connId: null,
    visitorId: null,
    agentOnlineCount: 0,
    hasOnlineAgent: false,
    sessionId: null,
    messages: [],
    panelVisible: false,
    widgetVisible: true,
    _hasMoreHistory: false,
    agentTyping: false,
    unreadCount: 0,
    historyLoading: false,
    showRateCard: false,
    rateCardSessionId: null,
  }
}

export const store = reactive<VisitorStoreState>(createInitialState())

export function resetStore() {
  Object.assign(store, createInitialState())
  clearSeenMsgIds()
}
