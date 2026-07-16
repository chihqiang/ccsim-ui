<template>
  <div v-if="visibleItems.length" class="ccsim-toolbar">
    <button
      v-for="item in visibleItems"
      :key="item.key"
      :class="['ccsim-toolbar__btn', isActive(item) ? 'ccsim-toolbar__btn--active' : '']"
      :title="item.label"
      @click="handleClick(item)"
    >
      <span v-if="isSafeIcon(item.icon)" v-html="item.icon" />
      <span v-else>{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ToolbarItem, ToolbarContext } from '@/types/toolbar'
import { DEFAULT_TOOLBAR_ORDER } from '@/types/toolbar'

const props = defineProps<{
  items: ToolbarItem[]
  context: ToolbarContext
}>()

function isSafeIcon(icon: string): boolean {
  if (typeof icon !== 'string') return false
  const trimmed = icon.trim()
  if (!trimmed.startsWith('<svg') || !trimmed.endsWith('</svg>')) return false
  const forbidden = /<script|<iframe|<object|<embed|<applet|on\w+\s*=/i
  return !forbidden.test(trimmed)
}

const sortedItems = computed(() => {
  return [...props.items].sort(
    (a, b) => (a.order ?? DEFAULT_TOOLBAR_ORDER) - (b.order ?? DEFAULT_TOOLBAR_ORDER),
  )
})

const visibleItems = computed(() => {
  return sortedItems.value.filter((p) => !p.show || p.show(props.context))
})

function isActive(item: ToolbarItem): boolean {
  return item.active?.(props.context) ?? false
}

function handleClick(item: ToolbarItem) {
  item.onClick({ ...props.context, active: isActive(item) })
}
</script>

<style>
.ccsim-toolbar {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-1) var(--sp-3) 0;
  border-top: 1px solid var(--cl-border);
  flex-shrink: 0;
}
.ccsim-toolbar__btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--cl-text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  outline: none;
  padding: 0;
}
.ccsim-toolbar__btn svg {
  width: 16px;
  height: 16px;
}
.ccsim-toolbar__btn:hover {
  color: var(--cl-warning);
  background: var(--cl-warning-bg);
}
.ccsim-toolbar__btn--active {
  color: var(--cl-warning);
  background: var(--cl-warning-bg);
}
</style>
