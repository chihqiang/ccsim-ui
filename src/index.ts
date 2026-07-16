export { SDK_VERSION } from '@/utils/version'

// SDK classes
export { VisitorSDK, getInstance as getVisitorInstance } from '@/visitorSdk'
export { AgentSDK, getInstance as getAgentInstance } from '@/agentSdk'

// Options
export type { VisitorInitOptions, AgentInitOptions } from '@/types'

// Enums & constants
export { SDKStatusEnum, Role, SenderTypeEnum } from '@/types/sdk'
export {
  OPTIMISTIC_TIMEOUT,
  HEARTBEAT_INTERVAL,
  MAX_RECONNECT_ATTEMPTS,
  RECONNECT_BASE_DELAY,
  MAX_RECONNECT_DELAY,
  MESSAGE_MAX_LENGTH,
  MAX_MESSAGES_PER_CONVERSATION,
  CONNECTION_TIMEOUT,
  AUTH_TIMEOUT,
  LOGIN_TIMEOUT,
  PAGINATION_TIMEOUT,
} from '@/types/sdk'
export { MessageStatusEnum } from '@/types/store'
export type { SessionStatus } from '@/types/store'

// Plugin types
export type { ToolbarItem, ToolbarContext } from '@/types/toolbar'
export type { PanelSection, PanelSectionContext } from '@/types/panel-section'
export type { RightPanelTab } from '@/types/right-panel'
export { DEFAULT_TAB_KEY, DEFAULT_TAB_ORDER } from '@/types/right-panel'

// Events
export type { SdkEvents, SdkEventName } from '@/types/events'

// Store types
export type { ChatMessageItem } from '@/types/store'

// Message types
export { ClientMessageTypeEnum } from '@/types/clientMessage'
export { ServerMessageTypeEnum } from '@/types/serverMessage'

// Utils
export { setLocale } from '@/i18n'
export { CcsimError, toCcsimError } from '@/utils/errors'
export type { LogLevel } from '@/utils/logger'
