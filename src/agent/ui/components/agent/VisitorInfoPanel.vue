<template>
  <div class="ccsim-visitor-info">
    <div class="ccsim-visitor-info__header">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <span class="ccsim-visitor-info__title">{{ $t('visitorInfo.title') }}</span>
    </div>
    <div class="ccsim-visitor-info__body scrollbar-thin">
      <div class="ccsim-visitor-info__profile">
        <van-image
          v-if="info.visitorAvatar"
          round
          width="44"
          height="44"
          :src="info.visitorAvatar"
          :alt="info.visitorNickname || '-'"
        />
        <div v-else class="ccsim-visitor-info__avatar-fallback">
          {{ (info.visitorNickname || '-').charAt(0) }}
        </div>
        <div class="ccsim-visitor-info__name">{{ info.visitorNickname || '-' }}</div>
      </div>

      <div class="ccsim-visitor-info__fields">
        <div class="ccsim-visitor-info__field">
          <span class="ccsim-visitor-info__field-label">{{ $t('visitorInfo.visitorId') }}</span>
          <span class="ccsim-visitor-info__field-value">{{ info.visitorId ?? '-' }}</span>
        </div>
        <div class="ccsim-visitor-info__field">
          <span class="ccsim-visitor-info__field-label">{{ $t('visitorInfo.externalId') }}</span>
          <span class="ccsim-visitor-info__field-value">{{ info.visitorExternalId || '-' }}</span>
        </div>
        <div class="ccsim-visitor-info__field">
          <span class="ccsim-visitor-info__field-label">{{ $t('visitorInfo.phone') }}</span>
          <span class="ccsim-visitor-info__field-value">{{ info.visitorPhone || '-' }}</span>
        </div>
        <div class="ccsim-visitor-info__field">
          <span class="ccsim-visitor-info__field-label">{{ $t('visitorInfo.source') }}</span>
          <span class="ccsim-visitor-info__field-value">{{ info.source || '-' }}</span>
        </div>
        <div class="ccsim-visitor-info__field">
          <span class="ccsim-visitor-info__field-label">{{ $t('visitorInfo.platform') }}</span>
          <span class="ccsim-visitor-info__field-value">{{ info.platform || '-' }}</span>
        </div>
        <div class="ccsim-visitor-info__field">
          <span class="ccsim-visitor-info__field-label">{{ $t('visitorInfo.ip') }}</span>
          <span class="ccsim-visitor-info__field-value">{{ info.ip || '-' }}</span>
        </div>
        <div class="ccsim-visitor-info__field ccsim-visitor-info__field--row">
          <span class="ccsim-visitor-info__field-label">{{ $t('visitorInfo.country') }}</span>
          <span class="ccsim-visitor-info__field-value">{{ info.country || '-' }}</span>
          <span class="ccsim-visitor-info__field-sep">/</span>
          <span class="ccsim-visitor-info__field-label">{{ $t('visitorInfo.province') }}</span>
          <span class="ccsim-visitor-info__field-value">{{ info.province || '-' }}</span>
          <span class="ccsim-visitor-info__field-sep">/</span>
          <span class="ccsim-visitor-info__field-label">{{ $t('visitorInfo.city') }}</span>
          <span class="ccsim-visitor-info__field-value">{{ info.city || '-' }}</span>
        </div>
        <div class="ccsim-visitor-info__field">
          <span class="ccsim-visitor-info__field-label">{{ $t('visitorInfo.userAgent') }}</span>
          <span class="ccsim-visitor-info__field-value ccsim-visitor-info__field-value--truncate">{{ info.userAgent || '-' }}</span>
        </div>
        <div class="ccsim-visitor-info__field">
          <span class="ccsim-visitor-info__field-label">{{ $t('visitorInfo.sessionId') }}</span>
          <span class="ccsim-visitor-info__field-value">#{{ store.currentSessionId }}</span>
        </div>
        <div class="ccsim-visitor-info__field">
          <span class="ccsim-visitor-info__field-label">{{ $t('visitorInfo.status') }}</span>
          <span :class="['ccsim-visitor-info__field-value', statusClass]">{{ statusText }}</span>
        </div>
        <div class="ccsim-visitor-info__field">
          <span class="ccsim-visitor-info__field-label">{{ $t('visitorInfo.waitDuration') }}</span>
          <span :class="['ccsim-visitor-info__field-value', info.waitingSeconds ? 'ccsim-visitor-info__field-value--warn' : '']">
            {{ info.waitingSeconds ? formatWaiting(info.waitingSeconds) : '-' }}
          </span>
        </div>
        <div class="ccsim-visitor-info__field">
          <span class="ccsim-visitor-info__field-label">{{ $t('visitorInfo.createdTime') }}</span>
          <span class="ccsim-visitor-info__field-value">{{ info.createdAt ? formatTime(info.createdAt) : '-' }}</span>
        </div>
        <div class="ccsim-visitor-info__field">
          <span class="ccsim-visitor-info__field-label">{{ $t('visitorInfo.assignee') }}</span>
          <span class="ccsim-visitor-info__field-value">{{ info.agentNickname || '-' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Image as VanImage } from 'vant'
import { store } from '@/agent/store/store'

const { t } = useI18n()

interface VisitorInfo {
  visitorAvatar?: string
  visitorNickname?: string
  visitorPhone?: string
  visitorId?: number
  visitorExternalId?: string
  source?: string
  ip?: string
  country?: string
  province?: string
  city?: string
  userAgent?: string
  platform?: string
  waitingSeconds?: number
  createdAt?: number
  agentNickname?: string
  status?: string
}

function getField(obj: any, ...keys: string[]): any {
  for (const k of keys) {
    const v = obj[k]
    if (v !== undefined && v !== null) return v
  }
  return undefined
}

const info = computed<VisitorInfo>(() => {
  if (!store.currentSessionId) return {}
  const waiting: any = store.waitingSessions.find(
    (s: any) => s.sessionId === store.currentSessionId || s.session_id === store.currentSessionId
  )
  if (waiting) {
    return {
      visitorAvatar: getField(waiting, 'visitorAvatar', 'visitor_avatar'),
      visitorNickname: getField(waiting, 'visitorNickname', 'visitor_nickname'),
      visitorPhone: getField(waiting, 'visitorPhone', 'visitor_phone'),
      visitorId: getField(waiting, 'visitorId', 'visitor_id'),
      visitorExternalId: getField(waiting, 'visitorExternalId', 'visitor_external_id'),
      source: getField(waiting, 'source'),
      ip: getField(waiting, 'ip'),
      country: getField(waiting, 'country'),
      province: getField(waiting, 'province'),
      city: getField(waiting, 'city'),
      userAgent: getField(waiting, 'userAgent', 'user_agent'),
      platform: getField(waiting, 'platform'),
      waitingSeconds: getField(waiting, 'waitingSeconds', 'waiting_seconds'),
      createdAt: getField(waiting, 'createdAt', 'created_at'),
      status: 'waiting',
    }
  }
  const active: any = store.sessions.find(
    (s: any) => s.sessionId === store.currentSessionId || s.session_id === store.currentSessionId
  )
  if (active) {
    return {
      visitorAvatar: getField(active, 'visitorAvatar', 'visitor_avatar'),
      visitorNickname: getField(active, 'visitorNickname', 'visitor_nickname'),
      visitorPhone: getField(active, 'visitorPhone', 'visitor_phone'),
      visitorId: getField(active, 'visitorId', 'visitor_id'),
      visitorExternalId: getField(active, 'visitorExternalId', 'visitor_external_id'),
      source: getField(active, 'source'),
      ip: getField(active, 'ip'),
      country: getField(active, 'country'),
      province: getField(active, 'province'),
      city: getField(active, 'city'),
      userAgent: getField(active, 'userAgent', 'user_agent'),
      platform: getField(active, 'platform'),
      waitingSeconds: getField(active, 'waitingSeconds', 'waiting_seconds'),
      createdAt: getField(active, 'createdAt', 'created_at'),
      agentNickname: getField(active, 'agentNickname', 'agent_nickname'),
      status: active.status || 'active',
    }
  }
  return {}
})

const statusText = computed(() => {
  switch (info.value.status) {
    case 'waiting': return t('visitorInfo.statusWaiting')
    case 'active': return t('visitorInfo.statusActive')
    case 'closed': return t('visitorInfo.statusClosed')
    default: return info.value.status || '-'
  }
})

const statusClass = computed(() => {
  switch (info.value.status) {
    case 'waiting': return 'ccsim-visitor-info__field-value--warn'
    case 'active': return 'ccsim-visitor-info__field-value--active'
    case 'closed': return 'ccsim-visitor-info__field-value--closed'
    default: return ''
  }
})

function formatWaiting(seconds: number): string {
  if (!seconds) return '-'
  if (seconds < 60) return t('sessionList.seconds', { seconds })
  if (seconds < 3600) return t('sessionList.minutes', { minutes: Math.floor(seconds / 60) })
  return t('sessionList.hours', { hours: Math.floor(seconds / 3600) })
}

function formatTime(ts: number): string {
  if (!ts) return '-'
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<style scoped>
.ccsim-visitor-info {
  width: 220px;
  border-left: 1px solid var(--cl-border);
  display: flex;
  flex-direction: column;
  background: var(--cl-bg-container);
  flex-shrink: 0;
}
.ccsim-visitor-info__header {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  border-bottom: 1px solid var(--cl-border-light);
  color: var(--cl-text-secondary);
}
.ccsim-visitor-info__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--cl-text-primary);
}
.ccsim-visitor-info__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-4);
}
.ccsim-visitor-info__profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding-bottom: var(--sp-4);
  border-bottom: 1px solid var(--cl-border-light);
  margin-bottom: var(--sp-3);
}
.ccsim-visitor-info__avatar-fallback {
  width: 44px; height: 44px;
  border-radius: var(--radius-full);
  background: var(--cl-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: #fff;
}
.ccsim-visitor-info__name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--cl-text-primary);
  text-align: center;
}
.ccsim-visitor-info__fields {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.ccsim-visitor-info__field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-0_5);
}
.ccsim-visitor-info__field-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--cl-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.ccsim-visitor-info__field-value {
  font-size: var(--font-size-sm);
  color: var(--cl-text-primary);
  word-break: break-all;
}
.ccsim-visitor-info__field-value--warn {
  color: var(--cl-warning);
  font-weight: var(--font-weight-medium);
}
.ccsim-visitor-info__field-value--active {
  color: var(--cl-primary);
  font-weight: var(--font-weight-medium);
}
.ccsim-visitor-info__field-value--closed {
  color: var(--cl-text-disabled);
}
.ccsim-visitor-info__field--row {
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--sp-1);
}
.ccsim-visitor-info__field-sep {
  color: var(--cl-text-disabled);
  font-size: var(--font-size-xs);
}
.ccsim-visitor-info__field-value--truncate {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
