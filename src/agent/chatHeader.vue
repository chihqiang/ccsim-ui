<template>
  <div class="ccsim-panel__chat-header">
    <div class="ccsim-panel__chat-visitor-info">
      <van-image
        v-if="currentVisitorAvatar"
        round
        width="28"
        height="28"
        :src="currentVisitorAvatar"
      />
      <div v-else class="ccsim-panel__chat-avatar-fallback">
        {{ currentVisitorName.charAt(0) }}
      </div>
      <div>
        <div class="ccsim-panel__chat-visitor-name">{{ currentVisitorName }}</div>
        <div v-if="currentVisitorSource" class="ccsim-panel__chat-visitor-source">
          {{ currentVisitorSource }}
        </div>
      </div>
    </div>
    <button class="ccsim-panel__close-session" @click="$emit('closeSession')">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
      {{ $t('visitorInfo.closeSession') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { Image as VanImage } from 'vant'
import { useCurrentVisitor } from '@/agent/useCurrentVisitor'

defineEmits<{ closeSession: [] }>()

const { currentVisitorName, currentVisitorAvatar, currentVisitorSource } = useCurrentVisitor()
</script>

<style scoped>
.ccsim-panel__chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-2_5) var(--sp-4);
  border-bottom: 1px solid var(--cl-border-light);
  background: var(--cl-bg-container);
  flex-shrink: 0;
}
.ccsim-panel__chat-visitor-info {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}
.ccsim-panel__chat-avatar-fallback {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--cl-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: #fff;
  flex-shrink: 0;
}
.ccsim-panel__chat-visitor-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--cl-text-primary);
  line-height: 1.3;
}
.ccsim-panel__chat-visitor-source {
  font-size: var(--font-size-xs);
  color: var(--cl-text-tertiary);
  line-height: 1.3;
}
.ccsim-panel__close-session {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  padding: 4px 10px;
  border: 1px solid var(--cl-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--cl-text-tertiary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.ccsim-panel__close-session svg {
  width: 14px;
  height: 14px;
  color: var(--cl-danger);
}
.ccsim-panel__close-session:hover {
  background: var(--cl-danger-bg);
  border-color: var(--cl-danger);
  color: var(--cl-danger);
}
</style>
