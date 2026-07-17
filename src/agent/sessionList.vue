<template>
  <div class="ccsim-sessions">
    <div class="ccsim-sessions__header">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span class="ccsim-sessions__header-title">{{ $t('sessionList.title') }}</span>
      <span class="ccsim-sessions__header-count">{{ list.length }}</span>
    </div>

    <div class="ccsim-sessions__tabs">
      <button
        :class="['ccsim-sessions__tab', tabIndex === 0 ? 'ccsim-sessions__tab--active' : '']"
        @click="tabIndex = 0"
      >
        {{ $t('sessionList.pending') }}
        <span v-if="waitingCount" class="ccsim-sessions__tab-badge">{{ waitingCount }}</span>
      </button>
      <button
        :class="['ccsim-sessions__tab', tabIndex === 1 ? 'ccsim-sessions__tab--active' : '']"
        @click="tabIndex = 1"
      >
        {{ $t('sessionList.active') }}
      </button>
    </div>

    <div ref="listContainer" class="ccsim-sessions__body scrollbar-thin" @scroll="onScroll">
      <div v-if="!list.length" class="ccsim-sessions__empty">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p>{{ $t('sessionList.empty') }}</p>
      </div>

      <div
        v-for="s in list"
        :key="s.sessionId ?? s.session_id"
        :class="[
          'ccsim-sessions__item',
          {
            'ccsim-sessions__item--active':
              (s.sessionId ?? s.session_id) === store.currentSessionId,
          },
        ]"
        @click="select(s)"
      >
        <div class="ccsim-sessions__item-avatar">
          <van-image
            v-if="s.visitorAvatar"
            round
            width="36"
            height="36"
            :src="s.visitorAvatar"
            :alt="s.visitorNickname || $t('sessionList.visitorLabel')"
          />
          <div v-else class="ccsim-sessions__avatar-text">
            {{ (s.visitorNickname || $t('sessionList.visitorLabel')).charAt(0) }}
          </div>
        </div>

        <div class="ccsim-sessions__item-content">
          <div class="ccsim-sessions__item-top">
            <span class="ccsim-sessions__item-name">{{
              s.visitorNickname || $t('sessionList.visitorLabel')
            }}</span>
            <div class="ccsim-sessions__item-meta">
              <span v-if="s.waitingSeconds" class="ccsim-sessions__item-waiting">
                {{ formatWaiting(s.waitingSeconds) }}
              </span>
              <span v-else-if="s.lastMsgTime" class="ccsim-sessions__item-time">{{
                formatTime(s.lastMsgTime)
              }}</span>
              <span v-if="s.unreadCount > 0" class="ccsim-sessions__item-unread">
                {{ s.unreadCount > 99 ? '99+' : s.unreadCount }}
              </span>
            </div>
          </div>
          <div class="ccsim-sessions__item-bottom">
            <span class="ccsim-sessions__item-preview">{{
              s.lastMsgContent || $t('panel.visitor.emptyTitle')
            }}</span>
            <van-tag v-if="s.source" plain size="medium">{{ s.source }}</van-tag>
          </div>
        </div>

        <button v-if="tabIndex === 0" class="ccsim-sessions__item-accept" @click.stop="select(s)">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>

      <div v-if="isLoadingMore" class="ccsim-sessions__more">
        <div class="ccsim-sessions__more-spinner" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Image as VanImage, Tag as VanTag } from 'vant'
import { store } from '@/store/agent'
import { getInstance } from '@/agentSdk'
import { useSessionPagination } from '@/agent/useSessionPagination'

const sdk = getInstance()
const { t } = useI18n()
const tabIndex = ref(0)
const listContainer = ref<HTMLElement>()
const pagination = useSessionPagination()
const isLoadingMore = ref(false)

const list = computed<any[]>(() => (tabIndex.value === 0 ? store.waitingSessions : store.sessions))
const waitingCount = computed(() => store.waitingSessions.length)

let tickTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  tickTimer = setInterval(() => {
    for (const s of store.waitingSessions as any[]) {
      if (s.waiting_seconds > 0) s.waiting_seconds++
    }
  }, 1000)
})
onUnmounted(() => {
  if (tickTimer) clearInterval(tickTimer)
})

watch(tabIndex, (tab) => {
  const currentId = store.currentSessionId
  if (currentId == null) return
  const getId = (s: any) => s.sessionId ?? s.session_id
  const inPending = store.waitingSessions.some((s) => getId(s) === currentId)
  const inActive = store.sessions.some((s) => getId(s) === currentId)
  if ((tab === 0 && !inPending) || (tab === 1 && !inActive)) {
    store.currentSessionId = null
  }
})

function select(s: any) {
  const id = s.sessionId ?? s.session_id
  store.currentSessionId = id
  if (s.unreadCount > 0) {
    store.unreadCount -= s.unreadCount
    s.unreadCount = 0
  }
  if (tabIndex.value === 0 && sdk) {
    sdk.acceptSession(id)
    tabIndex.value = 1
  }
  if (sdk) {
    store.historyLoading[id] = true
    sdk.requestSessionHistory(id)
  }
}

function onScroll() {
  const el = listContainer.value
  if (!el) return
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
    pagination.onLoadMore()
  }
}

function formatTime(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const hhmm = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  if (d.toDateString() === now.toDateString()) return hhmm
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return t('sessionList.yesterday', { hhmm })
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`
}

function formatWaiting(seconds: number): string {
  if (seconds < 60) return t('sessionList.seconds', { seconds })
  if (seconds < 3600) return t('sessionList.minutes', { minutes: Math.floor(seconds / 60) })
  return t('sessionList.hours', { hours: Math.floor(seconds / 3600) })
}
</script>

<style scoped>
.ccsim-sessions {
  width: 260px;
  border-right: 1px solid var(--cl-border);
  display: flex;
  flex-direction: column;
  background: var(--cl-bg-container);
  flex-shrink: 0;
}
.ccsim-sessions__header {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  border-bottom: 1px solid var(--cl-border-light);
  color: var(--cl-text-secondary);
}
.ccsim-sessions__header-title {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--cl-text-primary);
}
.ccsim-sessions__header-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--cl-text-tertiary);
  background: var(--cl-gray-100);
  border-radius: var(--radius-round);
}

/* Custom tabs */
.ccsim-sessions__tabs {
  display: flex;
  gap: var(--sp-1);
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--cl-border-light);
}
.ccsim-sessions__tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-1);
  padding: 5px 10px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--cl-text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.ccsim-sessions__tab:hover {
  color: var(--cl-text-secondary);
}
.ccsim-sessions__tab--active {
  background: var(--cl-primary-light);
  color: var(--cl-primary);
}
.ccsim-sessions__tab-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  color: #fff;
  background: var(--cl-primary);
  border-radius: var(--radius-round);
}

/* Body */
.ccsim-sessions__body {
  flex: 1;
  overflow-y: auto;
}
.ccsim-sessions__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: var(--sp-8) var(--sp-4);
  color: var(--cl-text-disabled);
  font-size: var(--font-size-sm);
}

/* Item */
.ccsim-sessions__item {
  display: flex;
  align-items: center;
  gap: var(--sp-2_5);
  padding: var(--sp-2_5) var(--sp-3);
  cursor: pointer;
  transition: background var(--transition-fast);
  border-bottom: 1px solid var(--cl-border-light);
  position: relative;
}
.ccsim-sessions__item:hover {
  background: var(--cl-bg-hover);
}
.ccsim-sessions__item--active {
  background: var(--cl-primary-light);
}
.ccsim-sessions__item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background: var(--cl-primary);
  border-radius: 0 2px 2px 0;
}
.ccsim-sessions__item-avatar {
  flex-shrink: 0;
}
.ccsim-sessions__avatar-text {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cl-gray-100);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--cl-text-secondary);
}

.ccsim-sessions__item-content {
  flex: 1;
  min-width: 0;
}
.ccsim-sessions__item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-1);
}
.ccsim-sessions__item-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--cl-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ccsim-sessions__item-meta {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  flex-shrink: 0;
}
.ccsim-sessions__item-time {
  font-size: var(--font-size-xs);
  color: var(--cl-text-disabled);
  white-space: nowrap;
}
.ccsim-sessions__item-waiting {
  font-size: var(--font-size-xs);
  color: var(--cl-warning);
  white-space: nowrap;
  font-weight: var(--font-weight-medium);
}
.ccsim-sessions__item-unread {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  color: #fff;
  background: var(--cl-danger);
  border-radius: var(--radius-round);
}

.ccsim-sessions__item-bottom {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  margin-top: var(--sp-0_5);
}
.ccsim-sessions__item-preview {
  font-size: var(--font-size-xs);
  color: var(--cl-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

/* Accept button */
.ccsim-sessions__item-accept {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--cl-primary);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  box-shadow: var(--shadow-btn);
  padding: 0;
}
.ccsim-sessions__item-accept svg {
  width: 14px;
  height: 14px;
}
.ccsim-sessions__item-accept:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-btn-hover);
}

/* More loader */
.ccsim-sessions__more {
  display: flex;
  justify-content: center;
  padding: var(--sp-3);
}
.ccsim-sessions__more-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--cl-gray-200);
  border-top-color: var(--cl-primary);
  border-radius: var(--radius-full);
  animation: ccsim-spin 0.6s linear infinite;
}
</style>
