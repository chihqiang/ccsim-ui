import { reactive } from 'vue'
import type { ChatMessageItem, SessionListItem } from '@/core/types/store'
import { SDKStatusEnum } from '@/core/types/sdk'
import { clearSeenMsgIds } from '@/core/utils/dedup'
import type { WaitingSessionListItem } from '@/core/types/serverMessage'

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
}

function createInitialState(): AgentStoreState {
  return {
    status: SDKStatusEnum.DISCONNECTED, connId: null,
    agentId: null, agentName: '', isAgentOnline: false,
    sessions: [], currentSessionId: null,
    optimisticMessages: [], messagesMap: {},
    waitingSessions: [], unreadCount: 0, visitorTyping: false,
    historyLoading: {}, _hasMoreHistory: {},
    panelVisible: false, widgetVisible: true,
    _hasMoreSessions: false, _sessionPage: 0,
  }
}

export const store = reactive<AgentStoreState>(createInitialState())

export function resetStore() { Object.assign(store, createInitialState()); clearSeenMsgIds() }
