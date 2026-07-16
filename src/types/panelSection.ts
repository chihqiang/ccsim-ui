import type { Component } from 'vue'

export interface PanelSection {
  key: string
  component: Component
  show?: (ctx: PanelSectionContext) => boolean
  order?: number
}

export interface PanelSectionContext {
  sessionId: number | null
  visitorId: string
}

export const DEFAULT_PANEL_SECTION_ORDER = 100
