import type { VisitorInitOptions } from '@/visitor/types'
import { ClientMessageTypeEnum } from '@/visitor/types'

export function buildVisitorAuth(opts: VisitorInitOptions) {
  return {
    type: ClientMessageTypeEnum.AUTH,
    tenant_no: opts.tenant_no,
    role: 'visitor',
    external_visitor_id: opts.visitor_uuid ?? '',
    nickname: opts.nickname || opts.metadata?.nickname,
    phone: opts.phone,
    platform: opts.platform,
  }
}
