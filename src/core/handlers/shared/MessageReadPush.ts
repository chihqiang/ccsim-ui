import type { MessageReadPush } from '@/core/types/serverMessage'
import type { MessageHandler } from '@/core/handlers/context'

export class MessageReadPushHandler implements MessageHandler<MessageReadPush> {
  readonly type = 'message_read_push'
  handle(msg: MessageReadPush, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    ctx.emit('messageReadPush', msg.session_id, msg.reader_role, msg.reader_id, msg.msg_id, msg.seq_num)
  }
}
