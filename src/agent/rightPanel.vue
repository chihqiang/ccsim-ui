<template>
  <div class="ccsim-right-panel">
    <!-- Tab bar: only when multiple tabs -->
    <div v-if="tabs.length > 1" class="ccsim-right-panel__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'ccsim-right-panel__tab',
          store.activeRightPanelTab === tab.key ? 'ccsim-right-panel__tab--active' : '',
        ]"
        @click="store.activeRightPanelTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Header: single tab mode -->
    <div v-else class="ccsim-right-panel__header">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-line-linecap="round"
        stroke-line-linejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <span class="ccsim-right-panel__title">{{ activeTab?.label }}</span>
    </div>

    <!-- Tab content -->
    <div class="ccsim-right-panel__body scrollbar-thin">
      <component v-if="activeTab" :is="activeTab.component" :key="activeTab.key" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { store } from '@/store/agent'
import { DEFAULT_TAB_ORDER } from '@/types/rightPanel'

const tabs = computed(() => {
  return [...store.rightPanelTabs].sort(
    (a, b) => (a.order ?? DEFAULT_TAB_ORDER) - (b.order ?? DEFAULT_TAB_ORDER),
  )
})

const activeTab = computed(() => {
  return tabs.value.find((t) => t.key === store.activeRightPanelTab) ?? tabs.value[0]
})

let prevTabKey: string | null = null

watch(
  () => store.activeRightPanelTab,
  (newKey) => {
    if (prevTabKey && prevTabKey !== newKey) {
      const prev = tabs.value.find((t) => t.key === prevTabKey)
      prev?.onDeactivate?.()
    }
    if (newKey) {
      const next = tabs.value.find((t) => t.key === newKey)
      next?.onActivate?.()
    }
    prevTabKey = newKey
  },
  { immediate: true },
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
}
.ccsim-right-panel__header {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  border-bottom: 1px solid var(--cl-border-light);
  color: var(--cl-text-secondary);
}
.ccsim-right-panel__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--cl-text-primary);
}
.ccsim-right-panel__tabs {
  display: flex;
  border-bottom: 1px solid var(--cl-border-light);
  overflow-x: auto;
}
.ccsim-right-panel__tab {
  flex: 1;
  min-width: 0;
  padding: var(--sp-2_5) var(--sp-3);
  border: none;
  background: transparent;
  color: var(--cl-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast);
}
.ccsim-right-panel__tab--active {
  color: var(--cl-primary);
  border-bottom-color: var(--cl-primary);
}
.ccsim-right-panel__tab:hover:not(.ccsim-right-panel__tab--active) {
  color: var(--cl-text-primary);
}
.ccsim-right-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-4);
}
</style>
