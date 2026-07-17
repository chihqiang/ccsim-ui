import type { Component } from 'vue'

export interface RightPanelModule {
  key: string
  label: string
  icon: string
  component: Component
  order?: number
  onActivate?: () => void
  onDeactivate?: () => void
}

export const DEFAULT_MODULE_KEY = 'visitor-info'
export const DEFAULT_MODULE_ORDER = 100
