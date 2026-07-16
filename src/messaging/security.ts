import { MESSAGE_MAX_LENGTH } from '@/types/sdk'
import { t } from '@/i18n'

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi,
  /data\s*:/gi,
]

export function validateMessage(content: string): { valid: boolean; error?: string } {
  if (!content || typeof content !== 'string') return { valid: false, error: t('send.validationEmpty') }
  const trimmed = content.trim()
  if (trimmed.length === 0) return { valid: false, error: t('send.validationEmpty') }
  if (trimmed.length > MESSAGE_MAX_LENGTH) return { valid: false, error: t('send.validationTooLong', { max: MESSAGE_MAX_LENGTH }) }
  return { valid: true }
}

export function sanitizeMessage(content: string): string {
  let s = content
  for (const p of DANGEROUS_PATTERNS) s = s.replace(p, '')
  return s.replace(/<[^>]*>/g, '').trim()
}
