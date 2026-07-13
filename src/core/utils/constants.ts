/** 乐观消息超时（ms） */
export const OPTIMISTIC_TIMEOUT = 5000

/** 心跳间隔（ms） */
export const HEARTBEAT_INTERVAL = 30000

/** 最大重连次数 */
export const MAX_RECONNECT_ATTEMPTS = 10

/** 基础重连延迟（ms） */
export const RECONNECT_BASE_DELAY = 1000

/** 最大重连延迟（ms） */
export const MAX_RECONNECT_DELAY = 60000

/** 消息最大长度 */
export const MESSAGE_MAX_LENGTH = 2000

/** 单会话消息列表最大保留条数 */
export const MAX_MESSAGES_PER_CONVERSATION = 500

/** WebSocket 连接超时（ms） */
export const CONNECTION_TIMEOUT = 10000

/** 认证响应超时（ms）— 与服务端 authTimeout 一致 */
export const AUTH_TIMEOUT = 10000

/** 坐席：登录超时（ms） */
export const LOGIN_TIMEOUT = 5000

/** 坐席：分页请求超时（ms） */
export const PAGINATION_TIMEOUT = 10000
