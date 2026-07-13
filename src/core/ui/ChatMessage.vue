<template>
  <div
    :class="[
      'ccsim-msg',
      `ccsim-msg--${align}`,
      `ccsim-msg--${msg.msgType || 'text'}`,
      { 'ccsim-msg--failed': msg.status === 'FAILED' }
    ]"
  >
    <!-- System message -->
    <template v-if="msg.senderRole === 'system'">
      <div class="ccsim-msg__system">{{ msg.content }}</div>
    </template>

    <!-- User/agent message -->
    <template v-else>
      <div class="ccsim-msg__body">
        <!-- Avatar (left only) -->
        <div v-if="align === 'left'" class="ccsim-msg__avatar-wrap">
          <van-image
            v-if="msg.avatar"
            round
            width="30"
            height="30"
            :src="msg.avatar"
            :alt="msg.nickname || $t('chat.visitor')"
          />
          <div v-else class="ccsim-msg__avatar ccsim-msg__avatar--other">
            {{ msg.nickname?.charAt(0) || '?' }}
          </div>
        </div>

        <div class="ccsim-msg__content">
          <!-- Nickname (left) -->
          <div v-if="align === 'left'" class="ccsim-msg__nick">{{ msg.nickname || $t('chat.visitor') }}</div>

          <!-- Bubble row -->
          <div class="ccsim-msg__row">
            <div class="ccsim-msg__bubble">
              <span v-if="msg.msgType === 'text' || !msg.msgType" class="ccsim-msg__text">{{ msg.content }}</span>
              <img
                v-else-if="msg.msgType === 'image'"
                :src="msg.content"
                class="ccsim-msg__image"
                :alt="$t('chat.imageAlt')"
                @click="$emit('previewImage', msg.content)"
              />
              <div v-else class="ccsim-msg__text">{{ msg.content }}</div>
            </div>

            <!-- Meta (time + status) -->
            <div class="ccsim-msg__meta">
              <span v-if="msg.status === 'PENDING'" class="ccsim-msg__status ccsim-msg__status--pending">
                <span class="ccsim-msg__spinner" />
              </span>
              <span v-else-if="msg.status === 'FAILED'" class="ccsim-msg__status ccsim-msg__status--failed">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </span>
              <span v-if="showTime && msg.status !== 'PENDING'" class="ccsim-msg__time">{{ formatTime(msg.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Image as VanImage } from 'vant'
import { useI18n } from 'vue-i18n'
import type { ChatMessageItem } from '@/core/types/store'

const { t } = useI18n()

defineProps<{
  msg: ChatMessageItem
  align: 'left' | 'right'
  showTime?: boolean
}>()

defineEmits<{
  previewImage: [url: string]
}>()

function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const hhmm = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  if (d.toDateString() === now.toDateString()) return hhmm
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return t('sessionList.yesterday', { hhmm })
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${hhmm}`
}
</script>

<style scoped>
.ccsim-msg {
  margin-bottom: var(--sp-2_5);
  padding: 0 var(--sp-4);
  animation: ccsim-msg-enter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ccsim-msg--system {
  text-align: center;
  margin: var(--sp-4) 0;
}
.ccsim-msg__system {
  display: inline-block;
  padding: 2px 14px;
  font-size: var(--font-size-sm);
  color: var(--cl-text-tertiary);
  background: var(--cl-gray-100);
  border-radius: var(--radius-round);
  line-height: 22px;
}

.ccsim-msg__body {
  display: flex;
  gap: var(--sp-2);
  align-items: flex-end;
}
.ccsim-msg--right .ccsim-msg__body {
  flex-direction: row-reverse;
}

/* Avatar */
.ccsim-msg__avatar-wrap {
  flex-shrink: 0;
  margin-bottom: var(--sp-1);
}
.ccsim-msg__avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--cl-text-inverse);
}
.ccsim-msg__avatar--other {
  background: var(--cl-accent);
}
.ccsim-msg__avatar--self {
  background: var(--cl-primary);
}

/* Content */
.ccsim-msg__content {
  max-width: 72%;
  min-width: 0;
}
.ccsim-msg__nick {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--cl-text-tertiary);
  margin-bottom: var(--sp-1);
  padding-left: var(--sp-1);
}

.ccsim-msg__row {
  display: flex;
  align-items: flex-end;
  gap: var(--sp-1_5);
}
.ccsim-msg--right .ccsim-msg__row {
  flex-direction: row-reverse;
}

/* Bubble */
.ccsim-msg__bubble {
  padding: 10px 16px;
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  word-break: break-word;
  white-space: pre-wrap;
  max-width: 100%;
}
.ccsim-msg--left .ccsim-msg__bubble {
  background: var(--cl-bubble-other-bg);
  color: var(--cl-bubble-other-text);
  border-radius: 4px var(--radius-lg) var(--radius-lg) var(--radius-lg);
  box-shadow: var(--shadow-bubble-other);
  border: 1px solid var(--cl-border-light);
}
.ccsim-msg--right .ccsim-msg__bubble {
  background: var(--cl-bubble-self-bg);
  color: var(--cl-bubble-self-text);
  border-radius: var(--radius-lg) 4px var(--radius-lg) var(--radius-lg);
  box-shadow: var(--shadow-bubble-self);
}

/* Image */
.ccsim-msg__image {
  display: block;
  max-width: 220px;
  max-height: 220px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}
.ccsim-msg__image:hover {
  opacity: 0.9;
}

/* Meta row (time + status) */
.ccsim-msg__meta {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--sp-0_5);
  padding-bottom: 2px;
}
.ccsim-msg__time {
  font-size: var(--font-size-xs);
  color: var(--cl-text-disabled);
  white-space: nowrap;
}
.ccsim-msg__status {
  display: inline-flex;
  align-items: center;
}
.ccsim-msg__status--pending {
  color: var(--cl-text-tertiary);
}
.ccsim-msg__status--failed {
  color: var(--cl-danger);
}

/* Spinner */
.ccsim-msg__spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 1.5px solid var(--cl-gray-300);
  border-top-color: var(--cl-gray-500);
  border-radius: var(--radius-full);
  animation: ccsim-spin 0.6s linear infinite;
}
</style>
