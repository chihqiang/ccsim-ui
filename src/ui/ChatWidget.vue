<template>
  <div
    v-if="visible"
    class="ccsim-widget"
    :class="{ 'ccsim-widget--agent': isAgent }"
    @click="$emit('click')"
  >
    <div class="ccsim-widget__btn">
      <svg v-if="!isAgent" class="ccsim-widget__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <svg v-else class="ccsim-widget__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    </div>

    <Transition name="ccsim-badge-pop">
      <span v-if="(unreadCount ?? 0) > 0" class="ccsim-widget__badge">
        {{ unreadCount! > 99 ? '99+' : unreadCount }}
      </span>
    </Transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  unreadCount?: number
  isAgent?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.ccsim-widget {
  position: fixed;
  bottom: var(--widget-bottom);
  right: var(--widget-right);
  z-index: var(--z-widget);
  cursor: pointer;
  user-select: none;
}

.ccsim-widget__btn {
  width: var(--widget-size);
  height: var(--widget-size);
  border-radius: var(--radius-full);
  background: var(--cl-primary);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
}
.ccsim-widget__btn:hover { transform: scale(1.08); }
.ccsim-widget__btn:active { transform: scale(0.94); }

.ccsim-widget__icon {
  width: 24px;
  height: 24px;
  color: #fff;
}

.ccsim-widget__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  border-radius: 999px;
}

.ccsim-badge-pop-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.ccsim-badge-pop-leave-active { transition: all 0.12s ease; }
.ccsim-badge-pop-enter-from { opacity: 0; transform: scale(0.3); }
.ccsim-badge-pop-leave-to { opacity: 0; transform: scale(0.3); }
</style>
