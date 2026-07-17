<template>
  <div class="ccsim-panel__offline">
    <div class="ccsim-panel__offline-card">
      <svg class="ccsim-panel__offline-icon" viewBox="0 0 80 80" fill="none">
        <rect x="8" y="12" width="64" height="48" rx="8" stroke="currentColor" stroke-width="2" />
        <path
          d="M24 36h32M24 44h20"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <path
          d="M40 60v8l-8-6h-8"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="56" cy="28" r="4" fill="currentColor" opacity="0.3" />
      </svg>
      <h3>{{ $t('panel.agent.offlineTitle') }}</h3>
      <p>{{ $t('panel.agent.offlineDesc') }}</p>
      <button class="ccsim-panel__online-btn" :disabled="isLoggingIn" @click="$emit('login')">
        <svg v-if="isLoggingIn" class="ccsim-panel__btn-spinner" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.3" />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
        <span>{{ isLoggingIn ? $t('panel.agent.loggingIn') : $t('panel.agent.onlineBtn') }}</span>
      </button>
      <p v-if="loginError" class="ccsim-panel__error">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {{ loginError }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isLoggingIn: boolean
  loginError: string
}>()

defineEmits<{ login: [] }>()
</script>

<style scoped>
.ccsim-panel__offline {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-10);
  background: var(--cl-bg-page);
}
.ccsim-panel__offline-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-10) var(--sp-8);
  background: var(--cl-bg-container);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  text-align: center;
  max-width: 320px;
}
.ccsim-panel__offline-icon {
  width: 56px;
  height: 56px;
  color: var(--cl-primary);
}
.ccsim-panel__offline-card h3 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--cl-text-primary);
}
.ccsim-panel__offline-card p {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--cl-text-tertiary);
}
.ccsim-panel__online-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 10px 32px;
  border: none;
  border-radius: var(--radius-round);
  background: var(--cl-primary);
  color: #fff;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-btn);
  margin-top: var(--sp-2);
}
.ccsim-panel__online-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-btn-hover);
}
.ccsim-panel__online-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}
.ccsim-panel__btn-spinner {
  width: 16px;
  height: 16px;
  animation: ccsim-spin 0.8s linear infinite;
}
.ccsim-panel__error {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  color: var(--cl-danger);
  font-size: var(--font-size-sm);
  margin-top: var(--sp-1);
}
</style>
