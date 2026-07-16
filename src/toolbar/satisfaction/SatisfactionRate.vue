<template>
  <div class="ccsim-satisfaction">
    <div v-if="!rated" class="ccsim-satisfaction__card">
      <p class="ccsim-satisfaction__title">{{ $t('satisfaction.title') }}</p>
      <div class="ccsim-satisfaction__btns">
        <button
          v-for="opt in options"
          :key="opt.value"
          :class="['ccsim-satisfaction__btn', `ccsim-satisfaction__btn--${opt.value}`]"
          @click="rate(opt.value)"
        >
          <svg v-if="opt.value === 1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <svg v-else-if="opt.value === 2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="15" x2="16" y2="15" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <span>{{ opt.label }}</span>
        </button>
      </div>
      <button class="ccsim-satisfaction__dismiss" @click="dismiss">{{ $t('satisfaction.later') }}</button>
    </div>
    <div v-else class="ccsim-satisfaction__rated">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{{ $t('satisfaction.thanks') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { store } from '@/store/visitor'
import { getInstance } from '@/visitorSdk'
import { satisfactionState, hideRate } from './state'

const { t } = useI18n()
const sdk = getInstance()
const rated = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null

onUnmounted(() => {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
})

const options = computed(() => {
  const labels = t('satisfaction.labels') as unknown as string[]
  return [
    { label: labels[0], value: 1 },
    { label: labels[1], value: 2 },
    { label: labels[2], value: 3 },
  ]
})

function rate(val: number) {
  const sid = satisfactionState.rateCardSessionId ?? store.sessionId
  if (sid && sdk) sdk.rateSession(sid, val)
  rated.value = true
  hideTimer = setTimeout(() => { hideRate(); hideTimer = null }, 2000)
}

function dismiss() { hideRate() }
</script>

<style scoped>
.ccsim-satisfaction {
  padding: 0 var(--sp-3) var(--sp-3);
  flex-shrink: 0;
}
.ccsim-satisfaction__card {
  background: var(--cl-bg-container);
  border: 1px solid var(--cl-border);
  border-radius: var(--radius-lg);
  padding: var(--sp-4);
  text-align: center;
  box-shadow: var(--shadow-sm);
  animation: ccsim-slide-up var(--transition-normal);
}
.ccsim-satisfaction__title {
  margin: 0 0 var(--sp-3);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--cl-text-secondary);
}
.ccsim-satisfaction__btns {
  display: flex;
  justify-content: center;
  gap: var(--sp-2);
  margin-bottom: var(--sp-2_5);
}
.ccsim-satisfaction__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-2_5) var(--sp-3);
  border: 1.5px solid var(--cl-border);
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  color: var(--cl-text-secondary);
  min-width: 64px;
}
.ccsim-satisfaction__btn svg { width: 22px; height: 22px; }
.ccsim-satisfaction__btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}
.ccsim-satisfaction__btn--1 { color: var(--cl-success); }
.ccsim-satisfaction__btn--1:hover {
  border-color: var(--cl-success);
  background: var(--cl-success-bg);
}
.ccsim-satisfaction__btn--2 { color: var(--cl-warning); }
.ccsim-satisfaction__btn--2:hover {
  border-color: var(--cl-warning);
  background: var(--cl-warning-bg);
}
.ccsim-satisfaction__btn--3 { color: var(--cl-danger); }
.ccsim-satisfaction__btn--3:hover {
  border-color: var(--cl-danger);
  background: var(--cl-danger-bg);
}
.ccsim-satisfaction__dismiss {
  border: none;
  background: transparent;
  font-size: var(--font-size-sm);
  color: var(--cl-text-tertiary);
  cursor: pointer;
  padding: var(--sp-1) var(--sp-2);
  transition: color var(--transition-fast);
}
.ccsim-satisfaction__dismiss:hover { color: var(--cl-text-secondary); }
.ccsim-satisfaction__rated {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: var(--sp-3);
  color: var(--cl-success);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  animation: ccsim-fade-in var(--transition-base);
}
</style>
