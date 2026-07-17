<template>
  <Transition name="ccsim-panel">
    <div v-if="store.panelVisible" class="ccsim-panel ccsim-panel--visitor">
      <!-- Header -->
      <header class="ccsim-panel__header">
        <div class="ccsim-panel__header-bg" />
        <button class="ccsim-panel__close" @click="sdk?.hidePanel()">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div class="ccsim-panel__header-content">
          <div class="ccsim-panel__header-avatar">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h2 class="ccsim-panel__title">{{ $t('panel.visitor.title') }}</h2>
            <p class="ccsim-panel__subtitle">
              <span v-if="store.agentOnlineCount > 0"
                >{{ store.agentOnlineCount }} {{ $t('panel.visitor.online') }}</span
              >
              <span v-else>{{ $t('panel.visitor.offline') }}</span>
            </p>
          </div>
        </div>
      </header>

      <!-- Connection status -->
      <ConnectionStatus
        v-if="
          store.status === 'connecting' ||
          store.status === 'disconnected' ||
          store.status === 'error'
        "
        :type="connectionStatusType"
      />

      <!-- Offline notice -->
      <div v-if="store.status === 'connected' && !store.hasOnlineAgent" class="ccsim-panel__notice">
        <svg
          width="16"
          height="16"
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
        <span>{{ $t('panel.visitor.noticeOffline') }}</span>
      </div>

      <!-- Messages -->
      <ChatMessages
        :messages="store.messages"
        self-role="visitor"
        :typing-visible="store.agentTyping"
        :empty-title="$t('panel.visitor.emptyTitle')"
        :empty-desc="$t('panel.visitor.emptyDesc')"
        :has-more-history="store.hasMoreHistory"
        :history-loading="store.historyLoading"
        @preview-image="previewUrl = $event"
        @load-more="loadMoreHistory"
      />

      <ImagePreview :visible="!!previewUrl" :url="previewUrl || ''" @close="previewUrl = null" />

      <!-- Panel sections (registered via SDK) -->
      <template v-for="section in visibleSections" :key="section.key">
        <component :is="section.component" />
      </template>

      <!-- Input toolbar -->
      <Toolbar v-if="store.sessionId" :items="store.toolbarItems" :context="toolbarContext" />

      <!-- Input -->
      <MessageInput :placeholder="$t('panel.visitor.placeholder')" @send="handleSend" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { store } from '@/store/visitor'
import { getInstance } from '@/visitorSdk'
import ChatMessages from '@/ui/chatMessages.vue'
import MessageInput from '@/ui/messageInput.vue'
import ConnectionStatus from '@/ui/connectionStatus.vue'
import ImagePreview from '@/ui/imagePreview.vue'
import Toolbar from '@/ui/toolbar.vue'
import type { ToolbarContext } from '@/types/toolbar'
import type { PanelSectionContext } from '@/types/panelSection'
import { Role } from '@/types/sdk'

const sdk = getInstance()
const previewUrl = ref<string | null>(null)

const connectionStatusType = computed<'connecting' | 'disconnected' | 'error' | 'reconnecting'>(
  () => {
    if (store.status === 'connecting') return 'connecting'
    if (store.status === 'disconnected') return 'disconnected'
    if (store.status === 'error') return 'error'
    return 'reconnecting'
  },
)

const toolbarContext = computed<ToolbarContext>(() => ({
  sessionId: store.sessionId,
  visitorId: store.visitorId,
  role: Role.VISITOR,
}))

const panelSectionContext = computed<PanelSectionContext>(() => ({
  sessionId: store.sessionId,
  visitorId: String(store.visitorId ?? ''),
}))

const visibleSections = computed(() => {
  return store.panelSections.filter((s) => !s.show || s.show(panelSectionContext.value))
})

function handleSend(text: string) {
  sdk?.sendChat(text)
}

function loadMoreHistory() {
  if (!sdk || !store.sessionId || store.historyLoading || !store.messages.length) return
  const oldest = store.messages[0]
  store.historyLoading = true
  sdk.requestSessionHistory(store.sessionId, oldest.seqNum)
}
</script>

<style scoped>
.ccsim-panel--visitor {
  position: fixed;
  bottom: 96px;
  right: 24px;
  width: min(380px, calc(100vw - 48px));
  height: min(580px, calc(100vh - 120px));
  background: var(--cl-bg-container);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-panel);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: var(--z-panel);
}

/* Header */
.ccsim-panel__header {
  position: relative;
  padding: var(--sp-4) var(--sp-5);
  flex-shrink: 0;
  overflow: hidden;
}
.ccsim-panel__header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0d47a1, #1565c0 50%, #1976d2);
  z-index: 0;
}
.ccsim-panel__header-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 20% 80%, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
}
.ccsim-panel__close {
  position: absolute;
  top: var(--sp-3);
  right: var(--sp-3);
  z-index: 2;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast);
  padding: 0;
}
.ccsim-panel__close svg {
  width: 14px;
  height: 14px;
}
.ccsim-panel__close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.ccsim-panel__header-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.ccsim-panel__header-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  backdrop-filter: blur(4px);
}
.ccsim-panel__header-avatar svg {
  width: 20px;
  height: 20px;
}

.ccsim-panel__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: #fff;
  line-height: 1.3;
}
.ccsim-panel__subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.4;
}

/* Notice bar */
.ccsim-panel__notice {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2_5) var(--sp-4);
  font-size: var(--font-size-sm);
  color: var(--cl-warning);
  background: var(--cl-warning-bg);
  border-bottom: 1px solid rgba(245, 158, 11, 0.15);
  flex-shrink: 0;
}

/* Panel transition */
.ccsim-panel-enter-active,
.ccsim-panel-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.ccsim-panel-enter-from,
.ccsim-panel-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}
</style>
