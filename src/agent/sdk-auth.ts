import type { AgentInitOptions } from '@/agent/types'
import { ClientMessageTypeEnum } from '@/agent/types'
import { t } from '@/core/i18n'

export function buildAgentAuth(opts: AgentInitOptions) {
  return {
    type: ClientMessageTypeEnum.AUTH,
    tenant_no: opts.tenant_no,
    role: 'agent',
    agent_account: opts.account,
    agent_password: opts.password,
  }
}

export function formatAgentAccount(account: string): string {
  return account ? account.substring(0, 2) + '***' : t('format.emptyNickname')
}
