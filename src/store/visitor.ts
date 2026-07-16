import { reactive } from 'vue'
import type { ChatMessageItem } from '@/types/store'
import { SDKStatusEnum } from '@/types/sdk'
import { clearSeenMsgIds } from '@/utils/dedup'
import type { ToolbarItem } from '@/types/toolbar'
import type { PanelSection } from '@/types/panelSection'

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
  toolbarItems: ToolbarItem[]
  panelSections: PanelSection[]
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
    toolbarItems: [],
    panelSections: [],
  }
}

export const store = reactive<VisitorStoreState>(createInitialState())

export function resetStore() {
  Object.assign(store, createInitialState())
  clearSeenMsgIds()
}
