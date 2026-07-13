export class CcsimError extends Error {
  code: string
  details?: Record<string, unknown>

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message)
    this.code = code
    this.details = details
    this.name = 'CcsimError'
  }

  toJSON(): Record<string, unknown> {
    return { name: this.name, code: this.code, message: this.message, details: this.details, stack: this.stack }
  }

  /** 构造给 SDK 使用者的 error 事件参数：code + message */
  toEvent(): string {
    return `[${this.code}] ${this.message}`
  }
}

export function toCcsimError(err: unknown, fallbackCode = 'E999'): CcsimError {
  if (err instanceof CcsimError) return err
  const message = err instanceof Error ? err.message : String(err ?? 'unknown error')
  return new CcsimError(fallbackCode, message, { cause: err instanceof Error ? err.stack : undefined })
}
