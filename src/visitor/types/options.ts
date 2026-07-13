import { LogLevel } from '@/core/types'

export interface VisitorInitOptions {
  tenant_no: string
  wsHost?: string | (() => string)
  logLevel?: LogLevel
  debug?: boolean
  locale?: 'zh-CN' | 'en-US'
  visitor_uuid?: string
  nickname?: string
  phone?: string
  platform?: string
  metadata?: Record<string, string>
}
