<template>
  <div class="ccsim-right-panel">
    <Transition name="ccsim-right-panel__view" mode="out-in">
      <!-- Grid view: show all modules as icons -->
      <div v-if="!store.activeRightPanelDetail" key="grid" class="ccsim-right-panel__view">
        <div class="ccsim-right-panel__header">
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
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <span class="ccsim-right-panel__title">{{ $t('panel.agent.tools') }}</span>
        </div>
        <div class="ccsim-right-panel__grid scrollbar-thin">
          <button
            v-for="mod in sortedModules"
            :key="mod.key"
            class="ccsim-right-panel__grid-item"
            @click="openDetail(mod.key)"
          >
            <div class="ccsim-right-panel__grid-icon" v-html="mod.icon" />
            <span class="ccsim-right-panel__grid-label">{{ mod.label }}</span>
          </button>
        </div>
      </div>

      <!-- Detail view: show selected module content -->
      <div v-else key="detail" class="ccsim-right-panel__view">
        <div class="ccsim-right-panel__header ccsim-right-panel__header--detail">
          <button class="ccsim-right-panel__back" @click="closeDetail">
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
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span class="ccsim-right-panel__title">{{ activeDetailModule?.label }}</span>
        </div>
        <div class="ccsim-right-panel__body scrollbar-thin">
          <component
            v-if="activeDetailModule"
            :is="activeDetailModule.component"
            :key="activeDetailModule.key"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { store } from '@/store/agent'
import { DEFAULT_MODULE_ORDER } from '@/types/sidebar'

const sortedModules = computed(() => {
  return [...store.rightPanelModules].sort(
    (a, b) => (a.order ?? DEFAULT_MODULE_ORDER) - (b.order ?? DEFAULT_MODULE_ORDER),
  )
})

const activeDetailModule = computed(() => {
  if (!store.activeRightPanelDetail) return null
  return store.rightPanelModules.find((m) => m.key === store.activeRightPanelDetail) ?? null
})

function openDetail(key: string) {
  const mod = store.rightPanelModules.find((m) => m.key === key)
  if (!mod) return

  // Deactivate previous module
  if (store.activeRightPanelDetail) {
    const prev = store.rightPanelModules.find((m) => m.key === store.activeRightPanelDetail)
    prev?.onDeactivate?.()
  }

  store.activeRightPanelDetail = key
  mod.onActivate?.()
}

function closeDetail() {
  if (!store.activeRightPanelDetail) return

  const mod = store.rightPanelModules.find((m) => m.key === store.activeRightPanelDetail)
  mod?.onDeactivate?.()
  store.activeRightPanelDetail = null
}

// Reset detail when session changes
watch(
  () => store.currentSessionId,
  () => {
    if (store.activeRightPanelDetail) {
      const mod = store.rightPanelModules.find((m) => m.key === store.activeRightPanelDetail)
      mod?.onDeactivate?.()
      store.activeRightPanelDetail = null
    }
  },
)
</script>

<style scoped>
.ccsim-right-panel {
  width: 220px;
  border-left: 1px solid var(--cl-border);
  display: flex;
  flex-direction: column;
  background: var(--cl-bg-container);
  flex-shrink: 0;
  overflow: hidden;
}
.ccsim-right-panel__view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.ccsim-right-panel__view-enter-active,
.ccsim-right-panel__view-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.ccsim-right-panel__view-enter-from {
  opacity: 0;
  transform: translateX(8px);
}
.ccsim-right-panel__view-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
.ccsim-right-panel__header {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  border-bottom: 1px solid var(--cl-border-light);
  color: var(--cl-text-secondary);
}
.ccsim-right-panel__header--detail {
  gap: var(--sp-1);
}
.ccsim-right-panel__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--cl-text-primary);
}
.ccsim-right-panel__back {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--cl-bg-hover);
  color: var(--cl-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  padding: 0;
  flex-shrink: 0;
}
.ccsim-right-panel__back:hover {
  background: var(--cl-gray-200);
  color: var(--cl-text-primary);
}

/* Grid view */
.ccsim-right-panel__grid {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-3);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--sp-2);
  align-content: start;
}
.ccsim-right-panel__grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-2);
  border: none;
  border-radius: var(--radius-lg);
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.ccsim-right-panel__grid-item:hover {
  background: var(--cl-bg-hover);
}
.ccsim-right-panel__grid-item:active {
  transform: scale(0.96);
}
.ccsim-right-panel__grid-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: var(--cl-primary-light);
  color: var(--cl-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}
.ccsim-right-panel__grid-icon :deep(svg) {
  width: 20px;
  height: 20px;
}
.ccsim-right-panel__grid-item:hover .ccsim-right-panel__grid-icon {
  background: var(--cl-primary);
  color: #fff;
}
.ccsim-right-panel__grid-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--cl-text-secondary);
  text-align: center;
  line-height: 1.2;
}

/* Detail view */
.ccsim-right-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-4);
}
</style>
