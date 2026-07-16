import type { MessageReadPush } from '@/types/serverMessage'
import type { MessageHandler } from '@/handlers/coreContext'

export class MessageReadPushHandler implements MessageHandler<MessageReadPush> {
  readonly type = 'message_read_push'
  handle(msg: MessageReadPush, ctx: { emit(event: string, ...args: unknown[]): void }): void {
    ctx.emit('messageReadPush', msg.session_id, msg.reader_role, msg.reader_id, msg.msg_id, msg.seq_num)
  }
}
