import type { ServerMessage } from '@/types/serverMessage'

export interface MessageHandler<T extends ServerMessage = ServerMessage> {
  readonly type: string
  handle(msg: T, ctx: { emit(event: string, ...args: unknown[]): void }): void
}
