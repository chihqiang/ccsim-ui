import type { Component } from 'vue'
import type { Role } from '@/types/sdk'

export interface ToolbarContext {
  sessionId: number | null
  visitorId?: number | null
  agentId?: number | null
  agentName?: string
  role: Role
  /** 当前 toolbar 项是否处于激活状态 */
  active?: boolean
  [key: string]: unknown
}

export interface ToolbarItem {
  key: string
  icon: string
  label: string
  order?: number
  active?: (ctx: ToolbarContext) => boolean
  onClick: (ctx: ToolbarContext) => void
  show?: (ctx: ToolbarContext) => boolean
  /** 注册面板组件，可选 */
  panel?: {
    component: Component | (() => Promise<Component>)
    show?: () => boolean
  }
}

export const DEFAULT_TOOLBAR_ORDER = 100
