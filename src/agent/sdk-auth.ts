import type { AgentInitOptions } from '@/types'
import { ClientMessageTypeEnum } from '@/types'
import { t } from '@/i18n'
import { Role } from '@/types/sdk'

export function buildAgentAuth(opts: AgentInitOptions) {
  return {
    type: ClientMessageTypeEnum.AUTH,
    tenant_no: opts.tenant_no,
    role: Role.AGENT,
    agent_account: opts.account,
    agent_password: opts.password,
  }
}

export function formatAgentAccount(account: string): string {
  return account ? account.substring(0, 2) + '***' : t('format.emptyNickname')
}
