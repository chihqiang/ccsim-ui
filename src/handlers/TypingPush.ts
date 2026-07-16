import type { TypingPush } from '@/types/serverMessage'
import type { MessageHandler } from '@/handlers/coreContext'

export class TypingPushHandler implements MessageHandler<TypingPush> {
  readonly type = 'typing_push'
  handle(msg: TypingPush, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    ctx.emit('typingPush', msg.session_id, msg.sender_role, msg.sender_id)
  }
}
