import type { Component } from 'vue'

export interface RightPanelTab {
  key: string
  label: string
  icon?: string
  component: Component
  order?: number
  onActivate?: () => void
  onDeactivate?: () => void
}

export const DEFAULT_TAB_KEY = 'visitor-info'
export const DEFAULT_TAB_ORDER = 100
