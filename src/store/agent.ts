import { reactive } from 'vue'
import type { ChatMessageItem, SessionListItem } from '@/types/store'
import { SDKStatusEnum } from '@/types/sdk'
import { clearSeenMsgIds } from '@/utils/dedup'
import type { WaitingSessionListItem } from '@/types/serverMessage'
import type { RightPanelSidebar } from '@/types/sidebar'
import { DEFAULT_MODULE_KEY } from '@/types/sidebar'
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
  hasMoreHistory: Record<number, boolean>
  hasMoreSessions: boolean
  sessionPage: number
  rightPanelModules: RightPanelSidebar[]
  activeRightPanelSidebar: string
  activeRightPanelDetail: string | null
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
    hasMoreHistory: {},
    panelVisible: false,
    widgetVisible: true,
    hasMoreSessions: false,
    sessionPage: 0,
    rightPanelModules: [],
    activeRightPanelSidebar: DEFAULT_MODULE_KEY,
    activeRightPanelDetail: null,
    toolbarItems: [],
  }
}

export const store = reactive<AgentStoreState>(createInitialState())

export function resetStore() {
  Object.assign(store, createInitialState())
  clearSeenMsgIds()
}
