# ccsim-ui

基于 TypeScript 开发，支持访客/客服双角色即时通信，
内置完整开箱即用聊天 UI 组件（基于 Vue 3 + Vant）。

## 安装

```bash
npm install @chihqiang/ccsim-ui
```

## 快速开始

### 访客端

```typescript
import { VisitorSDK } from '@chihqiang/ccsim-ui'
import '@chihqiang/ccsim-ui/style'

const sdk = new VisitorSDK({
  tenant_no: 'your_tenant',
  wsHost: 'wss://your-server.com/ws',
  nickname: '访客用户',
  phone: '13800138000',
})

sdk.on('allSet', () => {
  console.log('连接成功，visitor_id:', sdk.visitorId)
})

sdk.on('startSession', (sessionId) => {
  console.log('会话创建:', sessionId)
})
```

### 客服端

```typescript
import { AgentSDK } from '@chihqiang/ccsim-ui'
import '@chihqiang/ccsim-ui/style'

const sdk = new AgentSDK({
  tenant_no: 'your_tenant',
  wsHost: 'wss://your-server.com/ws',
  account: 'agent_account',
  password: 'agent_password',
  autoOnlineWhenOpen: true,
})

sdk.on('allSet', () => {
  console.log('登录成功，agent_id:', sdk.agentId)
})

sdk.on('newSession', (sessionId) => {
  console.log('新会话:', sessionId)
  sdk.acceptSession(sessionId)
})
```

## API 参考

### VisitorSDK

#### VisitorSDK 初始化选项

```typescript
new VisitorSDK(options: VisitorInitOptions)
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tenant_no` | `string` | 是 | 租户标识 |
| `wsHost` | `string \| (() => string)` | 否 | WebSocket 地址或工厂函数 |
| `logLevel` | `debug` / `info` / `warn` / `error` / `silent` | 否 | 日志级别 |
| `debug` | `boolean` | 否 | 等同于 `logLevel: 'debug'` |
| `locale` | `zh-CN` / `en-US` | 否 | UI 语言，默认 `zh-CN` |
| `visitor_uuid` | `string` | 否 | 访客持久化标识 |
| `nickname` | `string` | 否 | 显示名称 |
| `phone` | `string` | 否 | 手机号 |
| `platform` | `string` | 否 | 平台标识 |
| `metadata` | `Record<string, string>` | 否 | 自定义元数据 |

#### VisitorSDK 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `visitorId` | `number \| null` | 服务端分配的访客 ID |
| `sessionId` | `number \| null` | 当前会话 ID |
| `messages` | `ChatMessageItem[]` | 当前会话消息列表 |

#### VisitorSDK 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `sendChat` | `(content, msgType?) => void` | 发送消息 |
| `requestSessionHistory` | `(sessionId, beforeSeq?, limit?) => void` | 请求历史消息 |
| `closeSession` | `(sessionId) => void` | 关闭会话 |
| `rateSession` | `(sessionId, rating) => void` | 满意度评价 |
| `sendTyping` | `(sessionId) => void` | 发送正在输入状态 |
| `sendMessageRead` | `(sessionId, msgId, seqNum) => void` | 标记消息已读 |
| `updateVisitorInfo` | `(info) => void` | 更新访客信息 |
| `showPanel` | `() => void` | 显示聊天面板 |
| `hidePanel` | `() => void` | 隐藏聊天面板 |
| `on` | `(event, cb) => this` | 监听事件 |
| `off` | `(event, cb) => this` | 取消监听 |
| `destroy` | `() => Promise<void>` | 断开连接并清理 |

#### VisitorSDK 事件

| 事件 | 回调参数 | 说明 |
|------|----------|------|
| `allSet` | `()` | SDK 初始化完成 |
| `disconnected` | `(code, reason)` | 连接断开 |
| `reconnecting` | `(attempt, maxAttempts)` | 正在重连 |
| `reconnected` | `()` | 重连成功 |
| `error` | `(error)` | 错误 |
| `messageError` | `(error)` | 发送失败 |
| `startSession` | `(sessionId)` | 会话创建 |
| `endSession` | `(sessionId)` | 会话关闭 |
| `sessionAssigned` | `(sessionId)` | 会话分配给客服 |
| `satisfactionRated` | `(sessionId, status)` | 评价已提交 |
| `typingPush` | `(sessionId, senderRole, senderId)` | 对方正在输入 |
| `messageReadPush` | `(sessionId, readerRole, readerId, msgId, seqNum)` | 消息已读回执 |
| `visitorInfoUpdated` | `(visitorId, nickname?, phone?, avatar?)` | 访客信息已更新 |
| `agentStatus` | `(onlineCount, hasOnlineAgent)` | 在线客服数量变化 |

---

### AgentSDK

#### AgentSDK 初始化选项

```typescript
new AgentSDK(options: AgentInitOptions)
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tenant_no` | `string` | 是 | 租户标识 |
| `wsHost` | `string \| (() => string)` | 否 | WebSocket 地址或工厂函数 |
| `logLevel` | `debug` / `info` / `warn` / `error` / `silent` | 否 | 日志级别 |
| `debug` | `boolean` | 否 | 等同于 `logLevel: 'debug'` |
| `locale` | `zh-CN` / `en-US` | 否 | UI 语言 |
| `account` | `string` | 是 | 客服账号 |
| `password` | `string` | 是 | 客服密码 |
| `autoOnlineWhenOpen` | `boolean` | 否 | 页面打开后自动上线 |

#### AgentSDK 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `agentId` | `number \| null` | 服务端分配的客服 ID |
| `agentName` | `string` | 客服显示名称 |
| `currentSessionId` | `number \| null` | 当前选中的会话 ID |
| `messages` | `ChatMessageItem[]` | 当前会话消息列表 |
| `optimisticMessages` | `ChatMessageItem[]` | 待确认的乐观消息 |

#### AgentSDK 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `sendChat` | `(content, msgType?) => void` | 发送消息 |
| `setAgentOnline` | `() => void` | 上线 |
| `setAgentOffline` | `() => void` | 下线 |
| `acceptSession` | `(sessionId) => void` | 接待会话 |
| `closeSession` | `(sessionId) => void` | 关闭会话 |
| `requestSessionList` | `(page?, limit?, status?) => void` | 请求会话列表 |
| `requestWaitingSessionList` | `() => void` | 请求排队列表 |
| `requestSessionHistory` | `(sessionId, beforeSeq?, limit?) => void` | 请求历史消息 |
| `sendTyping` | `(sessionId) => void` | 发送正在输入状态 |
| `sendMessageRead` | `(sessionId, msgId, seqNum) => void` | 标记消息已读 |
| `showPanel` | `() => void` | 显示面板 |
| `hidePanel` | `() => void` | 隐藏面板 |
| `on` | `(event, cb) => this` | 监听事件 |
| `off` | `(event, cb) => this` | 取消监听 |
| `destroy` | `() => Promise<void>` | 下线并断开连接 |

#### AgentSDK 事件

| 事件 | 回调参数 | 说明 |
|------|----------|------|
| `allSet` | `()` | SDK 初始化完成 |
| `disconnected` | `(code, reason)` | 连接断开 |
| `reconnecting` | `(attempt, maxAttempts)` | 正在重连 |
| `reconnected` | `()` | 重连成功 |
| `error` | `(error)` | 错误 |
| `messageError` | `(error)` | 发送失败 |
| `newSession` | `(sessionId)` | 新会话进入排队 |
| `sessionAccepted` | `(sessionId)` | 会话已接待 |
| `sessionClosed` | `(sessionId)` | 会话已关闭 |
| `sessionListUpdated` | `()` | 会话列表已刷新 |
| `waitingListUpdated` | `()` | 排队列表已刷新 |
| `agentStatus` | `(onlineCount, hasOnlineAgent)` | 在线客服数量变化 |
| `typingPush` | `(sessionId, senderRole, senderId)` | 对方正在输入 |
| `messageReadPush` | `(sessionId, readerRole, readerId, msgId, seqNum)` | 消息已读回执 |
| `visitorInfoUpdated` | `(sessionId, visitorId, nickname?, phone?, avatar?)` | 访客信息已更新 |

---

### 工具函数

```typescript
import {
  SDK_VERSION,
  getVisitorInstance,
  getAgentInstance,
} from '@chihqiang/ccsim-ui'

// SDK 版本号
console.log(SDK_VERSION)

// 获取当前单例实例
const visitor = getVisitorInstance()
const agent = getAgentInstance()
```

---

## WebSocket 协议

### 连接流程

1. 客户端建立 WebSocket 连接
2. 客户端发送认证消息 `auth`
3. 服务端返回 `auth_ok`（含 `conn_id`），认证完成
4. 超时 10 秒未收到 `auth_ok` 则断开连接

### 心跳机制

- 客户端每 **30 秒**发送 `heartbeat`
- 服务端返回 `heartbeat_ack`
- 超过 **75 秒**未收到 ACK 则判定连接死亡，触发重连

### 重连策略

- 指数退避 + 抖动
- 基础延迟 1 秒，最大延迟 60 秒，最多 10 次

---

### 客户端消息（Client → Server）

#### `auth` — 认证

**访客：**

```json
{
  "type": "auth",
  "tenant_no": "string",
  "role": "visitor",
  "external_visitor_id": "string",
  "nickname": "string",
  "phone": "string",
  "platform": "string"
}
```

**客服：**

```json
{
  "type": "auth",
  "tenant_no": "string",
  "role": "agent",
  "agent_account": "string",
  "agent_password": "string"
}
```

#### `chat_send` — 发送消息

```json
{
  "type": "chat_send",
  "session_id": 123,
  "content": "消息内容",
  "msg_type": "text",
  "temp_id": "uuid-v4"
}
```

#### `heartbeat` — 心跳

```json
{ "type": "heartbeat" }
```

#### `typing` — 正在输入

```json
{
  "type": "typing",
  "session_id": 123
}
```

#### `message_read` — 消息已读

```json
{
  "type": "message_read",
  "session_id": 123,
  "msg_id": 456,
  "seq_num": 789
}
```

#### `agent_online` — 客服上线

```json
{ "type": "agent_online" }
```

#### `agent_offline` — 客服下线

```json
{ "type": "agent_offline" }
```

#### `session_accept` — 接待会话

```json
{
  "type": "session_accept",
  "session_id": 123
}
```

#### `session_close` — 关闭会话

```json
{
  "type": "session_close",
  "session_id": 123
}
```

#### `session_history` — 请求历史消息

```json
{
  "type": "session_history",
  "session_id": 123,
  "before_seq": 100,
  "limit": 20
}
```

#### `session_list` — 请求会话列表

```json
{
  "type": "session_list",
  "page": 1,
  "limit": 20,
  "status": "active"
}
```

#### `waiting_session_list` — 请求排队列表

```json
{ "type": "waiting_session_list" }
```

#### `satisfaction_rate` — 满意度评价

```json
{
  "type": "satisfaction_rate",
  "session_id": 123,
  "rating": 1
}
```

#### `visitor_update` — 更新访客信息

```json
{
  "type": "visitor_update",
  "nickname": "新昵称",
  "phone": "13800138000",
  "avatar": "https://...",
  "metadata": { "key": "value" }
}
```

---

### 服务端消息（Server → Client）

#### `auth_ok` — 认证成功

```json
{
  "type": "auth_ok",
  "conn_id": "string",
  "agent_id": 123,
  "visitor_id": 456
}
```

#### `heartbeat_ack` — 心跳响应

```json
{ "type": "heartbeat_ack" }
```

#### `chat_ack` — 消息发送确认

```json
{
  "type": "chat_ack",
  "temp_id": "uuid-v4",
  "msg_id": 789,
  "session_id": 123,
  "seq_num": 1,
  "created_at": 1700000000000
}
```

#### `chat_push` — 消息推送

```json
{
  "type": "chat_push",
  "msg_id": 789,
  "session_id": 123,
  "sender_role": "visitor",
  "sender_id": 456,
  "nickname": "访客",
  "content": "消息内容",
  "msg_type": "text",
  "seq_num": 1,
  "created_at": 1700000000000
}
```

#### `offline_push` — 离线消息推送

```json
{
  "type": "offline_push",
  "messages": [
    {
      "msg_id": 789,
      "session_id": 123,
      "sender_role": "agent",
      "sender_id": 100,
      "nickname": "客服",
      "content": "你好",
      "msg_type": "text",
      "seq_num": 1,
      "created_at": 1700000000000
    }
  ]
}
```

#### `history_batch` — 历史消息

```json
{
  "type": "history_batch",
  "session_id": 123,
  "count": 20,
  "data": [
    {
      "msg_id": 789,
      "session_id": 123,
      "sender_role": "visitor",
      "sender_id": 456,
      "nickname": "访客",
      "content": "消息内容",
      "msg_type": "text",
      "seq_num": 1,
      "created_at": 1700000000000
    }
  ]
}
```

#### `session_created` — 会话创建

```json
{
  "type": "session_created",
  "session_id": 123,
  "status": "waiting",
  "created_at": 1700000000000
}
```

#### `session_assigned` — 会话分配

```json
{
  "type": "session_assigned",
  "session_id": 123,
  "agent_id": 100,
  "agent_nickname": "客服A",
  "agent_avatar": "https://..."
}
```

#### `session_closed` — 会话关闭

```json
{
  "type": "session_closed",
  "session_id": 123,
  "close_reason": "agent_close"
}
```

#### `session_list_res` — 会话列表

```json
{
  "type": "session_list_res",
  "items": [
    {
      "session_id": 123,
      "visitor_id": 456,
      "visitor_nickname": "访客",
      "visitor_phone": "13800138000",
      "visitor_external_id": "ext_001",
      "agent_id": 100,
      "agent_nickname": "客服A",
      "status": "active",
      "source": "web",
      "ip": "127.0.0.1",
      "country": "中国",
      "province": "广东",
      "city": "深圳",
      "user_agent": "Mozilla/5.0...",
      "platform": "web",
      "last_msg_content": "你好",
      "last_msg_time": 1700000000000,
      "unread_count": 2,
      "created_at": 1700000000000
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

#### `waiting_session_list_res` — 排队列表

```json
{
  "type": "waiting_session_list_res",
  "items": [
    {
      "session_id": 123,
      "visitor_id": 456,
      "visitor_nickname": "访客",
      "visitor_avatar": "https://...",
      "visitor_phone": "13800138000",
      "visitor_external_id": "ext_001",
      "source": "web",
      "ip": "127.0.0.1",
      "country": "中国",
      "province": "广东",
      "city": "深圳",
      "user_agent": "Mozilla/5.0...",
      "platform": "web",
      "last_msg_content": "你好",
      "created_at": 1700000000000,
      "waiting_seconds": 30
    }
  ]
}
```

#### `new_session` — 新会话通知

```json
{
  "type": "new_session",
  "session_id": 123,
  "visitor_id": 456,
  "visitor_nickname": "访客",
  "visitor_phone": "13800138000",
  "visitor_external_id": "ext_001",
  "source": "web",
  "ip": "127.0.0.1",
  "platform": "web",
  "last_msg_content": "你好",
  "created_at": 1700000000000
}
```

#### `agent_status` — 在线客服状态

```json
{
  "type": "agent_status",
  "online_count": 3,
  "has_online_agent": true
}
```

#### `typing_push` — 正在输入推送

```json
{
  "type": "typing_push",
  "session_id": 123,
  "sender_role": "visitor",
  "sender_id": 456
}
```

#### `message_read_push` — 已读回执

```json
{
  "type": "message_read_push",
  "session_id": 123,
  "reader_role": "agent",
  "reader_id": 100,
  "msg_id": 789,
  "seq_num": 1
}
```

#### `satisfaction_rate` — 评价确认

```json
{
  "type": "satisfaction_rate",
  "session_id": 123,
  "status": "ok"
}
```

#### `visitor_update_ok` — 访客信息更新确认

```json
{ "type": "visitor_update_ok" }
```

#### `visitor_info_updated` — 访客信息变更通知

```json
{
  "type": "visitor_info_updated",
  "session_id": 123,
  "visitor_id": 456,
  "nickname": "新昵称",
  "phone": "13900139000",
  "avatar": "https://..."
}
```

#### `error` — 错误

```json
{
  "type": "error",
  "code": "AUTH_FAILED",
  "err_msg": "invalid credentials",
  "message": "认证失败"
}
```

---

## 消息类型

### ClientMessageTypeEnum

| 值 | 字符串 | 说明 |
|----|--------|------|
| `AUTH` | `auth` | 认证 |
| `HEARTBEAT` | `heartbeat` | 心跳 |
| `CHAT_SEND` | `chat_send` | 发送消息 |
| `AGENT_ONLINE` | `agent_online` | 客服上线 |
| `AGENT_OFFLINE` | `agent_offline` | 客服下线 |
| `SESSION_ACCEPT` | `session_accept` | 接待会话 |
| `SESSION_CLOSE` | `session_close` | 关闭会话 |
| `SESSION_LIST` | `session_list` | 会话列表 |
| `SESSION_HISTORY` | `session_history` | 历史消息 |
| `WAITING_SESSION_LIST` | `waiting_session_list` | 排队列表 |
| `SATISFACTION_RATE` | `satisfaction_rate` | 满意度评价 |
| `USER_UPDATE` | `visitor_update` | 更新访客信息 |
| `TYPING` | `typing` | 正在输入 |
| `MESSAGE_READ` | `message_read` | 消息已读 |

### ServerMessageTypeEnum

| 值 | 字符串 | 说明 |
|----|--------|------|
| `AUTH_OK` | `auth_ok` | 认证成功 |
| `HEARTBEAT_ACK` | `heartbeat_ack` | 心跳响应 |
| `CHAT_ACK` | `chat_ack` | 消息确认 |
| `CHAT_PUSH` | `chat_push` | 消息推送 |
| `OFFLINE_PUSH` | `offline_push` | 离线消息 |
| `HISTORY_BATCH` | `history_batch` | 历史消息 |
| `SESSION_CREATED` | `session_created` | 会话创建 |
| `SESSION_ASSIGNED` | `session_assigned` | 会话分配 |
| `SESSION_CLOSED` | `session_closed` | 会话关闭 |
| `SESSION_LIST_RES` | `session_list_res` | 会话列表 |
| `WAITING_SESSION_LIST_RES` | `waiting_session_list_res` | 排队列表 |
| `NEW_SESSION` | `new_session` | 新会话 |
| `AGENT_STATUS` | `agent_status` | 在线状态 |
| `AGENT_ONLINE` | `agent_online` | 客服上线 |
| `AGENT_OFFLINE` | `agent_offline` | 客服下线 |
| `TYPING_PUSH` | `typing_push` | 正在输入 |
| `MESSAGE_READ_PUSH` | `message_read_push` | 已读回执 |
| `ERROR` | `error` | 错误 |
| `VISITOR_INFO_UPDATED` | `visitor_info_updated` | 访客信息更新 |
| `SATISFACTION_RATE` | `satisfaction_rate` | 评价确认 |
| `VISITOR_UPDATE_OK` | `visitor_update_ok` | 更新确认 |

### MessageStatusEnum

| 值 | 说明 |
|----|------|
| `PENDING` | 发送中（乐观消息） |
| `DELIVERED` | 已送达 |
| `FAILED` | 发送失败（5 秒超时） |

### SenderTypeEnum

| 值 | 说明 |
|----|------|
| `visitor` | 访客 |
| `agent` | 客服 |
| `system` | 系统 |

---

## 常量

| 常量 | 值 | 说明 |
|------|-----|------|
| `HEARTBEAT_INTERVAL` | `30000` | 心跳发送间隔（ms） |
| `AUTH_TIMEOUT` | `10000` | 认证超时（ms） |
| `CONNECTION_TIMEOUT` | `10000` | 连接超时（ms） |
| `OPTIMISTIC_TIMEOUT` | `5000` | 乐观消息超时（ms） |
| `MESSAGE_MAX_LENGTH` | `2000` | 单条消息最大字符数 |
| `MAX_MESSAGES_PER_CONVERSATION` | `500` | 每会话最大保留消息数 |
| `MAX_RECONNECT_ATTEMPTS` | `10` | 最大重连次数 |
| `RECONNECT_BASE_DELAY` | `1000` | 重连基础延迟（ms） |
| `MAX_RECONNECT_DELAY` | `60000` | 重连最大延迟（ms） |
| `MIN_SEND_INTERVAL` | `500` | 最小发送间隔（ms） |

---

## i18n

支持中文（`zh-CN`）和英文（`en-US`），
通过构造函数 `locale` 参数设置。

```typescript
const sdk = new VisitorSDK({
  locale: 'en-US',
  // ...
})
```

运行时切换：

```typescript
import { setLocale } from '@chihqiang/ccsim-ui'
setLocale('en-US')
```

---

## TypeScript

包自带完整类型声明，无需额外安装 `@types` 包。

```typescript
import type {
  VisitorInitOptions,
  AgentInitOptions,
} from '@chihqiang/ccsim-ui'
```

---

## 本地存储键

| 键名 | 用途 |
|------|------|
| `ccsim_visitor_uuid` | 访客持久化 UUID |
| `ccsim_session_id` | 访客当前会话 ID |
| `ccsim_agent_should_online` | 客服自动上线状态 |
