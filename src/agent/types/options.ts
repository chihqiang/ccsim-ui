import { LogLevel } from '@/core/types'

export interface AgentInitOptions {
  tenant_no: string
  wsHost?: string | (() => string)
  logLevel?: LogLevel
  debug?: boolean
  locale?: 'zh-CN' | 'en-US'
  account: string
  password: string
  autoOnlineWhenOpen?: boolean
}
