<template>
  <div v-if="errored" class="ccsim-error">
    <div class="ccsim-error__card">
      <svg class="ccsim-error__icon" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="30" stroke="currentColor" stroke-width="2" opacity="0.2" />
        <line x1="32" y1="32" x2="48" y2="48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        <line x1="48" y1="32" x2="32" y2="48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
      </svg>
      <p class="ccsim-error__title">{{ $t('errorBoundary.title') }}</p>
      <button class="ccsim-error__btn" @click="recover">{{ $t('errorBoundary.reload') }}</button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const errored = ref(false)
onErrorCaptured(() => { errored.value = true; return false })
function recover() { errored.value = false }
</script>

<style scoped>
.ccsim-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--sp-8);
  background: var(--cl-bg-page);
}
.ccsim-error__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-3);
  text-align: center;
}
.ccsim-error__icon {
  width: 48px;
  height: 48px;
  color: var(--cl-danger);
}
.ccsim-error__title {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--cl-text-secondary);
  line-height: 1.5;
}
.ccsim-error__btn {
  padding: 8px 24px;
  border: none;
  border-radius: var(--radius-round);
  background: var(--cl-primary);
  color: #fff;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-btn);
}
.ccsim-error__btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-btn-hover);
}
</style>
