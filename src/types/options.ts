import type { LogLevel } from '@/utils/logger'

export interface AgentInitOptions {
  tenant_no: string
  wsHost?: string | (() => string)
  logLevel?: LogLevel
  debug?: boolean
  locale?: 'zh-CN' | 'en-US'
  account: string
  password: string
  autoOnlineWhenOpen?: boolean
  /** 活跃超时（分钟），0 表示不检测，默认 15 分钟 */
  activeTimeout?: number
}

export interface VisitorInitOptions {
  tenant_no: string
  wsHost?: string | (() => string)
  logLevel?: LogLevel
  debug?: boolean
  locale?: 'zh-CN' | 'en-US'
  visitor_uuid?: string
  nickname?: string
  phone?: string
  platform: string
  metadata?: Record<string, string>
}
