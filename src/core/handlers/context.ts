import type { ServerMessage } from '@/core/types/serverMessage'

export interface MessageHandler<T extends ServerMessage = ServerMessage> {
  readonly type: string
  handle(msg: T, ctx: { emit(event: string, ...args: unknown[]): void }): void
}
