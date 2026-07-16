import type { VisitorInitOptions } from '@/types'
import { ClientMessageTypeEnum } from '@/types'
import { Role } from '@/types/sdk'

export function buildVisitorAuth(opts: VisitorInitOptions) {
  return {
    type: ClientMessageTypeEnum.AUTH,
    tenant_no: opts.tenant_no,
    role: Role.VISITOR,
    external_visitor_id: opts.visitor_uuid ?? '',
    nickname: opts.nickname || opts.metadata?.nickname,
    phone: opts.phone,
    platform: opts.platform,
  }
}
