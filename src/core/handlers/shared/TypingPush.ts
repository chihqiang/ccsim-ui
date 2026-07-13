import type { TypingPush } from '@/core/types/serverMessage'
import type { MessageHandler } from '@/core/handlers/context'

export class TypingPushHandler implements MessageHandler<TypingPush> {
  readonly type = 'typing_push'
  handle(msg: TypingPush, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    ctx.emit('typingPush', msg.session_id, msg.sender_role, msg.sender_id)
  }
}
