-- CCSIM-UI 数据库表结构
-- 基于前端协议定义设计

-- 1. 租户表
CREATE TABLE ccsim_tenants (
  id          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  tenant_no   VARCHAR(64)   NOT NULL                COMMENT '租户编号',
  name        VARCHAR(128)  DEFAULT ''               COMMENT '租户名称',
  status      TINYINT       NOT NULL DEFAULT 1      COMMENT '状态 1:启用 0:禁用',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_tenant_no (tenant_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='租户表';

-- 2. 访客表
CREATE TABLE ccsim_visitors (
  id          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  tenant_no   VARCHAR(64)   NOT NULL                COMMENT '租户编号',
  external_id VARCHAR(128)  DEFAULT ''               COMMENT '外部访客标识(UUID)',
  nickname    VARCHAR(128)  DEFAULT ''               COMMENT '访客昵称',
  phone       VARCHAR(32)   DEFAULT ''               COMMENT '手机号',
  platform    VARCHAR(32)   DEFAULT ''               COMMENT '平台 web/ios/android',
  avatar      VARCHAR(512)  DEFAULT ''               COMMENT '头像URL',
  metadata    JSON          DEFAULT NULL             COMMENT '扩展元数据',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_tenant_ext (tenant_no, external_id),
  KEY idx_tenant (tenant_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='访客表';

-- 3. 客服表
CREATE TABLE ccsim_agents (
  id          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  tenant_no   VARCHAR(64)   NOT NULL                COMMENT '租户编号',
  account     VARCHAR(128)  NOT NULL                COMMENT '客服账号',
  password    VARCHAR(256)  NOT NULL                COMMENT '密码(哈希存储)',
  nickname    VARCHAR(128)  DEFAULT ''               COMMENT '客服昵称',
  avatar      VARCHAR(512)  DEFAULT ''               COMMENT '头像URL',
  is_online   TINYINT       NOT NULL DEFAULT 0      COMMENT '在线状态 1:在线 0:离线',
  status      TINYINT       NOT NULL DEFAULT 1      COMMENT '状态 1:启用 0:禁用',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_tenant_account (tenant_no, account),
  KEY idx_tenant_online (tenant_no, is_online)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='客服表';

-- 4. 会话表
CREATE TABLE ccsim_sessions (
  id                BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  tenant_no         VARCHAR(64)   NOT NULL                COMMENT '租户编号',
  visitor_id        BIGINT        NOT NULL                COMMENT '访客ID',
  agent_id          BIGINT        NULL                    COMMENT '客服ID',
  visitor_nickname  VARCHAR(128)  DEFAULT ''               COMMENT '访客昵称',
  agent_nickname    VARCHAR(128)  DEFAULT ''               COMMENT '客服昵称',
  status            VARCHAR(32)   NOT NULL DEFAULT 'pending' COMMENT '状态 pending/active/closed',
  source            VARCHAR(64)   DEFAULT ''               COMMENT '来源渠道',
  ip                VARCHAR(45)   DEFAULT ''               COMMENT '访客IP',
  country           VARCHAR(64)   DEFAULT ''               COMMENT '国家',
  province          VARCHAR(64)   DEFAULT ''               COMMENT '省份',
  city              VARCHAR(64)   DEFAULT ''               COMMENT '城市',
  user_agent        VARCHAR(512)  DEFAULT ''               COMMENT '浏览器UA',
  platform          VARCHAR(32)   DEFAULT ''               COMMENT '平台',
  close_reason      VARCHAR(256)  DEFAULT ''               COMMENT '关闭原因',
  last_msg_id       BIGINT        NULL                    COMMENT '最近消息ID',
  last_msg_time     TIMESTAMP     NULL                    COMMENT '最近消息时间',
  unread_count      INT           NOT NULL DEFAULT 0      COMMENT '未读消息数',
  created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  assigned_at       TIMESTAMP     NULL                    COMMENT '分配客服时间',
  closed_at         TIMESTAMP     NULL                    COMMENT '关闭时间',
  PRIMARY KEY (id),
  KEY idx_tenant_status (tenant_no, status),
  KEY idx_visitor (visitor_id),
  KEY idx_agent_status (agent_id, status),
  KEY idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='会话表';

-- 5. 消息表
CREATE TABLE ccsim_messages (
  id            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  session_id    BIGINT        NOT NULL                COMMENT '会话ID',
  sender_role   VARCHAR(16)   NOT NULL                COMMENT '发送者角色 visitor/agent/system',
  sender_id     BIGINT        NOT NULL                COMMENT '发送者ID',
  nickname      VARCHAR(128)  DEFAULT ''               COMMENT '发送者昵称',
  content       TEXT          NOT NULL                COMMENT '消息内容',
  msg_type      VARCHAR(32)   NOT NULL DEFAULT 'text' COMMENT '消息类型 text/image/file',
  seq_num       INT           NOT NULL                COMMENT '会话内消息序号',
  is_read       TINYINT       NOT NULL DEFAULT 0      COMMENT '已读状态 1:已读 0:未读',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_session_seq (session_id, seq_num),
  KEY idx_session_time (session_id, created_at),
  KEY idx_session_read (session_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='消息表';

-- 6. 满意度评价表
CREATE TABLE ccsim_satisfaction_ratings (
  id          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  session_id  BIGINT        NOT NULL                COMMENT '会话ID',
  visitor_id  BIGINT        NOT NULL                COMMENT '访客ID',
  agent_id    BIGINT        NULL                    COMMENT '客服ID',
  rating      TINYINT       NOT NULL                COMMENT '评分 1:满意 2:一般 3:不满意',
  comment     VARCHAR(500)  DEFAULT ''               COMMENT '评价内容',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_session (session_id),
  KEY idx_agent (agent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='满意度评价表';

-- 7. 连接表
CREATE TABLE ccsim_connections (
  id              VARCHAR(128)  NOT NULL                COMMENT '连接ID(conn_id)',
  tenant_no       VARCHAR(64)   NOT NULL                COMMENT '租户编号',
  role            VARCHAR(16)   NOT NULL                COMMENT '角色 visitor/agent',
  ref_id          BIGINT        NULL                    COMMENT '关联ID(visitor_id或agent_id)',
  ip              VARCHAR(45)   DEFAULT ''               COMMENT '连接IP',
  connected_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '连接时间',
  last_active_at  TIMESTAMP     NULL                    COMMENT '最后活跃时间',
  PRIMARY KEY (id),
  KEY idx_tenant_role (tenant_no, role),
  KEY idx_ref (role, ref_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='连接表';
