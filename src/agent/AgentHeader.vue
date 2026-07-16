<template>
  <header class="ccsim-agent-header" @mousedown="$emit('dragStart', $event)">
    <div class="ccsim-agent-header__bg" />
    <div class="ccsim-agent-header__left">
      <button v-if="store.isAgentOnline" class="ccsim-agent-header__logout" @click.stop="logout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>{{ $t('panel.agent.offlineTitleAttr') }}</span>
      </button>
    </div>
    <div class="ccsim-agent-header__center">
      <div class="ccsim-agent-header__title-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <div>
        <h2 class="ccsim-agent-header__title">{{ $t('panel.agent.title') }}</h2>
        <span v-if="store.isAgentOnline" class="ccsim-agent-header__status">
          <span class="ccsim-agent-header__dot" />
          {{ store.agentName || '' }}{{ $t('panel.agent.onlineSuffix') }}
        </span>
      </div>
    </div>
    <div class="ccsim-agent-header__right">
      <button class="ccsim-agent-header__action" title="最小化" @click.stop="$emit('toggleFullscreen')">
        <svg v-if="isFullscreen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 14 10 14 10 20" />
          <polyline points="20 10 14 10 14 4" />
          <line x1="14" y1="10" x2="21" y2="3" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      </button>
      <button class="ccsim-agent-header__action ccsim-agent-header__action--close" title="关闭工作台" @click.stop="$emit('close')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { store } from '@/store/agent'
import { getInstance } from '@/agentSdk'

defineProps<{ isFullscreen?: boolean }>()
defineEmits<{ dragStart: [e: MouseEvent]; toggleFullscreen: []; close: [] }>()

const sdk = getInstance()

function logout() {
  if (!sdk) return
  sdk.setAgentOffline()
  store.isAgentOnline = false
}
</script>

<style scoped>
.ccsim-agent-header {
  position: relative;
  padding: var(--sp-3) var(--sp-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
  overflow: hidden;
}
.ccsim-agent-header:active { cursor: grabbing; }
.ccsim-agent-header__bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0d47a1, #1565c0 50%, #1976d2);
  z-index: 0;
}
.ccsim-agent-header__bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 60%);
}

.ccsim-agent-header__left,
.ccsim-agent-header__right {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--sp-1);
}

.ccsim-agent-header__logout {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  padding: 4px 10px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: var(--radius-md);
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.8);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.ccsim-agent-header__logout svg { width: 14px; height: 14px; }
.ccsim-agent-header__logout:hover {
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.3);
}

.ccsim-agent-header__center {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--sp-2_5);
}
.ccsim-agent-header__title-icon {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-full);
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.ccsim-agent-header__title-icon svg { width: 18px; height: 18px; }
.ccsim-agent-header__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: #fff;
  line-height: 1.3;
}
.ccsim-agent-header__status {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: var(--font-size-sm);
  color: rgba(255,255,255,0.65);
  line-height: 1.3;
}
.ccsim-agent-header__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: #34d399;
  box-shadow: 0 0 6px rgba(52, 211, 153, 0.6);
}

.ccsim-agent-header__action {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  padding: 0;
}
.ccsim-agent-header__action svg { width: 16px; height: 16px; }
.ccsim-agent-header__action:hover {
  background: rgba(255,255,255,0.15);
  color: #fff;
}
.ccsim-agent-header__action--close:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}
</style>
