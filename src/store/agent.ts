import { reactive } from 'vue'
import type { ChatMessageItem, SessionListItem } from '@/types/store'
import { SDKStatusEnum } from '@/types/sdk'
import { clearSeenMsgIds } from '@/utils/dedup'
import type { WaitingSessionListItem } from '@/types/serverMessage'
import type { RightPanelTab } from '@/types/right-panel'
import { DEFAULT_TAB_KEY } from '@/types/right-panel'
import type { ToolbarItem } from '@/types/toolbar'

export interface AgentStoreState {
  status: SDKStatusEnum
  connId: string | null
  panelVisible: boolean
  widgetVisible: boolean
  agentId: number | null
  agentName: string
  isAgentOnline: boolean
  sessions: SessionListItem[]
  currentSessionId: number | null
  optimisticMessages: ChatMessageItem[]
  messagesMap: Record<number, ChatMessageItem[]>
  waitingSessions: WaitingSessionListItem[]
  unreadCount: number
  visitorTyping: boolean
  historyLoading: Record<number, boolean>
  _hasMoreHistory: Record<number, boolean>
  _hasMoreSessions: boolean
  _sessionPage: number
  rightPanelTabs: RightPanelTab[]
  activeRightPanelTab: string
  toolbarItems: ToolbarItem[]
}

function createInitialState(): AgentStoreState {
  return {
    status: SDKStatusEnum.DISCONNECTED,
    connId: null,
    agentId: null,
    agentName: '',
    isAgentOnline: false,
    sessions: [],
    currentSessionId: null,
    optimisticMessages: [],
    messagesMap: {},
    waitingSessions: [],
    unreadCount: 0,
    visitorTyping: false,
    historyLoading: {},
    _hasMoreHistory: {},
    panelVisible: false,
    widgetVisible: true,
    _hasMoreSessions: false,
    _sessionPage: 0,
    rightPanelTabs: [],
    activeRightPanelTab: DEFAULT_TAB_KEY,
    toolbarItems: [],
  }
}

export const store = reactive<AgentStoreState>(createInitialState())

export function resetStore() {
  Object.assign(store, createInitialState())
  clearSeenMsgIds()
}
