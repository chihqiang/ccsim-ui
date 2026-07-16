<template>
  <div :class="['ccsim-conn', `ccsim-conn--${props.type}`]">
    <div class="ccsim-conn__inner">
      <span
        v-if="props.type === 'connecting' || props.type === 'reconnecting'"
        class="ccsim-conn__spinner"
      />
      <svg
        v-else
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
      <span class="ccsim-conn__text">{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  type: 'connecting' | 'reconnecting' | 'disconnected' | 'error'
}>()

const message = computed(() => {
  switch (props.type) {
    case 'connecting':
      return t('connection.connecting')
    case 'reconnecting':
      return t('connection.reconnecting')
    case 'disconnected':
      return t('connection.disconnected')
    case 'error':
      return t('connection.error')
  }
})
</script>

<style scoped>
.ccsim-conn {
  flex-shrink: 0;
}
.ccsim-conn__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: var(--sp-2_5) var(--sp-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  animation: ccsim-slide-down var(--transition-base);
}
.ccsim-conn--connecting .ccsim-conn__inner,
.ccsim-conn--reconnecting .ccsim-conn__inner {
  background: var(--cl-info-bg);
  color: var(--cl-info);
  border-bottom: 1px solid rgba(107, 114, 128, 0.15);
}
.ccsim-conn--disconnected .ccsim-conn__inner,
.ccsim-conn--error .ccsim-conn__inner {
  background: var(--cl-danger-bg);
  color: var(--cl-danger);
  border-bottom: 1px solid rgba(239, 68, 68, 0.15);
}
.ccsim-conn__spinner {
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--radius-full);
  animation: ccsim-spin 0.6s linear infinite;
  opacity: 0.5;
}
.ccsim-conn__text {
  line-height: 1;
}
</style>
