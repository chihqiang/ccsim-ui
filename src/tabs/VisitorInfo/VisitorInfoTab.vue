<template>
  <div class="ccsim-visitor-tab">
    <div class="ccsim-visitor-tab__profile">
      <van-image
        v-if="info.visitorAvatar"
        round
        width="44"
        height="44"
        :src="info.visitorAvatar"
        :alt="info.visitorNickname || '-'"
      />
      <div v-else class="ccsim-visitor-tab__avatar-fallback">
        {{ (info.visitorNickname || '-').charAt(0) }}
      </div>
      <div class="ccsim-visitor-tab__name">{{ info.visitorNickname || '-' }}</div>
    </div>

    <div class="ccsim-visitor-tab__fields">
      <div class="ccsim-visitor-tab__field">
        <span class="ccsim-visitor-tab__field-label">{{ $t('visitorInfo.visitorId') }}</span>
        <span class="ccsim-visitor-tab__field-value">{{ info.visitorId ?? '-' }}</span>
      </div>
      <div class="ccsim-visitor-tab__field">
        <span class="ccsim-visitor-tab__field-label">{{ $t('visitorInfo.externalId') }}</span>
        <span class="ccsim-visitor-tab__field-value">{{ info.visitorExternalId || '-' }}</span>
      </div>
      <div class="ccsim-visitor-tab__field">
        <span class="ccsim-visitor-tab__field-label">{{ $t('visitorInfo.phone') }}</span>
        <span class="ccsim-visitor-tab__field-value">{{ info.visitorPhone || '-' }}</span>
      </div>
      <div class="ccsim-visitor-tab__field">
        <span class="ccsim-visitor-tab__field-label">{{ $t('visitorInfo.source') }}</span>
        <span class="ccsim-visitor-tab__field-value">{{ info.source || '-' }}</span>
      </div>
      <div class="ccsim-visitor-tab__field">
        <span class="ccsim-visitor-tab__field-label">{{ $t('visitorInfo.platform') }}</span>
        <span class="ccsim-visitor-tab__field-value">{{ info.platform || '-' }}</span>
      </div>
      <div class="ccsim-visitor-tab__field">
        <span class="ccsim-visitor-tab__field-label">{{ $t('visitorInfo.ip') }}</span>
        <span class="ccsim-visitor-tab__field-value">{{ info.ip || '-' }}</span>
      </div>
      <div class="ccsim-visitor-tab__field ccsim-visitor-tab__field--row">
        <span class="ccsim-visitor-tab__field-label">{{ $t('visitorInfo.country') }}</span>
        <span class="ccsim-visitor-tab__field-value">{{ info.country || '-' }}</span>
        <span class="ccsim-visitor-tab__field-sep">/</span>
        <span class="ccsim-visitor-tab__field-label">{{ $t('visitorInfo.province') }}</span>
        <span class="ccsim-visitor-tab__field-value">{{ info.province || '-' }}</span>
        <span class="ccsim-visitor-tab__field-sep">/</span>
        <span class="ccsim-visitor-tab__field-label">{{ $t('visitorInfo.city') }}</span>
        <span class="ccsim-visitor-tab__field-value">{{ info.city || '-' }}</span>
      </div>
      <div class="ccsim-visitor-tab__field">
        <span class="ccsim-visitor-tab__field-label">{{ $t('visitorInfo.userAgent') }}</span>
        <span class="ccsim-visitor-tab__field-value ccsim-visitor-tab__field-value--truncate">{{ info.userAgent || '-' }}</span>
      </div>
      <div class="ccsim-visitor-tab__field">
        <span class="ccsim-visitor-tab__field-label">{{ $t('visitorInfo.sessionId') }}</span>
        <span class="ccsim-visitor-tab__field-value">#{{ store.currentSessionId }}</span>
      </div>
      <div class="ccsim-visitor-tab__field">
        <span class="ccsim-visitor-tab__field-label">{{ $t('visitorInfo.status') }}</span>
        <span :class="['ccsim-visitor-tab__field-value', statusClass]">{{ statusText }}</span>
      </div>
      <div class="ccsim-visitor-tab__field">
        <span class="ccsim-visitor-tab__field-label">{{ $t('visitorInfo.waitDuration') }}</span>
        <span :class="['ccsim-visitor-tab__field-value', info.waitingSeconds ? 'ccsim-visitor-tab__field-value--warn' : '']">
          {{ info.waitingSeconds ? formatWaiting(info.waitingSeconds) : '-' }}
        </span>
      </div>
      <div class="ccsim-visitor-tab__field">
        <span class="ccsim-visitor-tab__field-label">{{ $t('visitorInfo.createdTime') }}</span>
        <span class="ccsim-visitor-tab__field-value">{{ info.createdAt ? formatTime(info.createdAt) : '-' }}</span>
      </div>
      <div class="ccsim-visitor-tab__field">
        <span class="ccsim-visitor-tab__field-label">{{ $t('visitorInfo.assignee') }}</span>
        <span class="ccsim-visitor-tab__field-value">{{ info.agentNickname || '-' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Image as VanImage } from 'vant'
import { store } from '@/store/agent'

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

function getField(obj: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    const v = obj[k]
    if (v !== undefined && v !== null) return v
  }
  return undefined
}

const info = computed<VisitorInfo>(() => {
  if (!store.currentSessionId) return {}
  const waiting = store.waitingSessions.find(
    (s) => s.session_id === store.currentSessionId
  ) as Record<string, unknown> | undefined
  if (waiting) {
    return {
      visitorAvatar: getField(waiting, 'visitorAvatar', 'visitor_avatar') as string,
      visitorNickname: getField(waiting, 'visitorNickname', 'visitor_nickname') as string,
      visitorPhone: getField(waiting, 'visitorPhone', 'visitor_phone') as string | undefined,
      visitorId: getField(waiting, 'visitorId', 'visitor_id') as number,
      visitorExternalId: getField(waiting, 'visitorExternalId', 'visitor_external_id') as string | undefined,
      source: getField(waiting, 'source') as string,
      ip: getField(waiting, 'ip') as string | undefined,
      country: getField(waiting, 'country') as string | undefined,
      province: getField(waiting, 'province') as string | undefined,
      city: getField(waiting, 'city') as string | undefined,
      userAgent: getField(waiting, 'userAgent', 'user_agent') as string | undefined,
      platform: getField(waiting, 'platform') as string | undefined,
      waitingSeconds: getField(waiting, 'waitingSeconds', 'waiting_seconds') as number,
      createdAt: getField(waiting, 'createdAt', 'created_at') as number,
      status: 'waiting',
    }
  }
  const active = store.sessions.find(
    (s) => s.sessionId === store.currentSessionId
  ) as Record<string, unknown> | undefined
  if (active) {
    return {
      visitorAvatar: getField(active, 'visitorAvatar', 'visitor_avatar') as string,
      visitorNickname: getField(active, 'visitorNickname', 'visitor_nickname') as string,
      visitorPhone: getField(active, 'visitorPhone', 'visitor_phone') as string | undefined,
      visitorId: getField(active, 'visitorId', 'visitor_id') as number,
      visitorExternalId: getField(active, 'visitorExternalId', 'visitor_external_id') as string | undefined,
      source: getField(active, 'source') as string,
      ip: getField(active, 'ip') as string | undefined,
      country: getField(active, 'country') as string | undefined,
      province: getField(active, 'province') as string | undefined,
      city: getField(active, 'city') as string | undefined,
      userAgent: getField(active, 'userAgent', 'user_agent') as string | undefined,
      platform: getField(active, 'platform') as string | undefined,
      waitingSeconds: getField(active, 'waitingSeconds', 'waiting_seconds') as number | undefined,
      createdAt: getField(active, 'createdAt', 'created_at') as number,
      agentNickname: getField(active, 'agentNickname', 'agent_nickname') as string,
      status: (active.status as string) || 'active',
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
    case 'waiting': return 'ccsim-visitor-tab__field-value--warn'
    case 'active': return 'ccsim-visitor-tab__field-value--active'
    case 'closed': return 'ccsim-visitor-tab__field-value--closed'
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
.ccsim-visitor-tab__profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding-bottom: var(--sp-4);
  border-bottom: 1px solid var(--cl-border-light);
  margin-bottom: var(--sp-3);
}
.ccsim-visitor-tab__avatar-fallback {
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
.ccsim-visitor-tab__name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--cl-text-primary);
  text-align: center;
}
.ccsim-visitor-tab__fields {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.ccsim-visitor-tab__field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-0_5);
}
.ccsim-visitor-tab__field-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--cl-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.ccsim-visitor-tab__field-value {
  font-size: var(--font-size-sm);
  color: var(--cl-text-primary);
  word-break: break-all;
}
.ccsim-visitor-tab__field-value--warn {
  color: var(--cl-warning);
  font-weight: var(--font-weight-medium);
}
.ccsim-visitor-tab__field-value--active {
  color: var(--cl-primary);
  font-weight: var(--font-weight-medium);
}
.ccsim-visitor-tab__field-value--closed {
  color: var(--cl-text-disabled);
}
.ccsim-visitor-tab__field--row {
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--sp-1);
}
.ccsim-visitor-tab__field-sep {
  color: var(--cl-text-disabled);
  font-size: var(--font-size-xs);
}
.ccsim-visitor-tab__field-value--truncate {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
