<template>
  <div ref="scrollRef" class="ccsim-msgs scrollbar-thin" @scroll="onScroll">
    <!-- History loading -->
    <div v-if="historyLoading" class="ccsim-msgs__loader">
      <div class="ccsim-msgs__loader-spinner" />
      <span>{{ $t('chat.loadingHistory') }}</span>
    </div>

    <!-- Empty state -->
    <div v-if="!messages.length && !historyLoading" class="ccsim-msgs__empty">
      <svg class="ccsim-msgs__empty-icon" viewBox="0 0 80 80" fill="none">
        <rect x="8" y="12" width="64" height="48" rx="8" stroke="currentColor" stroke-width="2" />
        <path d="M24 36h32M24 44h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <path d="M40 60v8l-8-6h-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="56" cy="28" r="4" fill="currentColor" opacity="0.3" />
      </svg>
      <p class="ccsim-msgs__empty-title">{{ emptyTitle }}</p>
      <p class="ccsim-msgs__empty-desc">{{ emptyDesc }}</p>
    </div>

    <!-- Messages -->
    <template v-if="messages.length">
      <template v-for="(group, gIdx) in groupedMessages" :key="gIdx">
        <div v-if="group.date" class="ccsim-msgs__date">
          <span>{{ group.date }}</span>
        </div>
        <ChatMessage
          v-for="msg in group.items"
          :key="msg.tempId || msg.msgId"
          :msg="msg"
          :align="msg.senderRole === selfRole ? 'right' : 'left'"
          :show-time="msg.msgId > 0"
          @preview-image="(url) => $emit('previewImage', url)"
        />
      </template>
    </template>

    <!-- Typing indicator -->
    <div v-if="typingVisible" class="ccsim-msgs__typing">
      <div class="ccsim-msgs__typing-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <div class="ccsim-msgs__typing-bubble">
        <span class="ccsim-msgs__typing-dot" />
        <span class="ccsim-msgs__typing-dot" />
        <span class="ccsim-msgs__typing-dot" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ChatMessageItem } from '@/types/store'
import ChatMessage from './ChatMessage.vue'

const { t } = useI18n()

const props = defineProps<{
  messages: ChatMessageItem[]
  selfRole: string
  historyLoading?: boolean
  hasMoreHistory?: boolean
  typingVisible?: boolean
  emptyTitle?: string
  emptyDesc?: string
}>()

const emit = defineEmits<{
  loadMore: []
  previewImage: [url: string]
}>()

const scrollRef = ref<HTMLElement>()
const isNearBottom = ref(true)

function scrollToBottom() {
  const el = scrollRef.value
  if (!el) return
  requestAnimationFrame(() => {
    el.scrollTop = el.scrollHeight
  })
}

watch(() => props.messages, async (_new, old) => {
  await nextTick()
  if (!scrollRef.value) return
  if ((!old || old.length === 0) && props.messages.length > 0) {
    scrollToBottom()
  } else if (isNearBottom.value) {
    scrollToBottom()
  }
}, { deep: true })

function onScroll() {
  const el = scrollRef.value
  if (!el) return
  isNearBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight <= el.clientHeight * 0.3
  if (el.scrollTop <= 40 && props.hasMoreHistory && !props.historyLoading) emit('loadMore')
}

interface MessageGroup { date: string; items: ChatMessageItem[] }

const groupedMessages = computed<MessageGroup[]>(() => {
  const groups: MessageGroup[] = []
  let current: MessageGroup | null = null
  for (const msg of props.messages) {
    const dateLabel = formatDateLabel(msg.createdAt)
    if (!current || current.date !== dateLabel) {
      current = { date: dateLabel, items: [] }
      groups.push(current)
    }
    current.items.push(msg)
  }
  return groups
})

function formatDateLabel(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = (today.getTime() - msgDate.getTime()) / 86400000
  if (diff === 0) return ''
  if (diff === 1) return t('chat.yesterday')
  if (diff < 7) { const wd = t('chat.weekdays') as unknown as string[]; return wd[d.getDay()] }
  return t('chat.dateFormat', { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() })
}
</script>

<style scoped>
.ccsim-msgs {
  flex: 1;
  overflow-y: auto;
  background: var(--cl-bg-page);
  padding: var(--sp-3) 0;
}

/* Loader */
.ccsim-msgs__loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2_5);
  padding: var(--sp-6);
  font-size: var(--font-size-sm);
  color: var(--cl-text-tertiary);
  animation: ccsim-fade-in var(--transition-base);
}
.ccsim-msgs__loader-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--cl-gray-200);
  border-top-color: var(--cl-primary);
  border-radius: var(--radius-full);
  animation: ccsim-spin 0.6s linear infinite;
}

/* Empty state */
.ccsim-msgs__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--sp-16) var(--sp-6);
  animation: ccsim-fade-in var(--transition-normal);
  gap: var(--sp-2);
}
.ccsim-msgs__empty-icon {
  width: 64px;
  height: 64px;
  color: var(--cl-gray-300);
  margin-bottom: var(--sp-2);
}
.ccsim-msgs__empty-title {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--cl-text-secondary);
}
.ccsim-msgs__empty-desc {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--cl-text-disabled);
  text-align: center;
  max-width: 220px;
}

/* Date divider */
.ccsim-msgs__date {
  display: flex;
  justify-content: center;
  margin: var(--sp-6) 0 var(--sp-3);
}
.ccsim-msgs__date span {
  padding: 2px 14px;
  font-size: var(--font-size-sm);
  color: var(--cl-text-tertiary);
  background: var(--cl-gray-100);
  border-radius: var(--radius-round);
  line-height: 22px;
}

/* Typing indicator */
.ccsim-msgs__typing {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 0 var(--sp-4);
  margin-bottom: var(--sp-2);
  animation: ccsim-fade-in var(--transition-base);
}
.ccsim-msgs__typing-avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-full);
  background: var(--cl-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--cl-gray-400);
}
.ccsim-msgs__typing-bubble {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 11px 16px;
  background: var(--cl-white);
  border-radius: 4px var(--radius-lg) var(--radius-lg) var(--radius-lg);
  box-shadow: var(--shadow-bubble-other);
  border: 1px solid var(--cl-border-light);
}
.ccsim-msgs__typing-dot {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  background: var(--cl-gray-400);
  animation: ccsim-pulse-dot 1.4s ease-in-out infinite;
}
.ccsim-msgs__typing-dot:nth-child(2) { animation-delay: 0.2s; }
.ccsim-msgs__typing-dot:nth-child(3) { animation-delay: 0.4s; }
</style>
