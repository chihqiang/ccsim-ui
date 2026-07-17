import type { NewSession } from '@/types'
import type { MessageHandler } from '@/handlers/visitorContext'

/**
 * NewSession 消息处理器 — Visitor 端
 *
 * new_session 由服务端广播给同租户所有连接，visitor 不需要处理此消息，
 * 注册空 handler 以消除「未处理的消息类型」警告。
 */
export class VisitorNewSessionHandler implements MessageHandler<NewSession> {
  readonly type = 'new_session'
  handle(): void {}
}
