<template>
  <Transition name="ccsim-panel">
    <div
      v-if="store.panelVisible"
      ref="panelRef"
      class="ccsim-panel ccsim-panel--agent"
      :class="{ 'ccsim-panel--fullscreen': isFullscreen }"
      :style="panelStyle"
    >
      <AgentHeader
        @mousedown="startDrag"
        @toggle-fullscreen="toggleFullscreen"
        @close="hidePanel"
        :is-fullscreen="isFullscreen"
      />

      <!-- Offline state -->
      <OfflineState
        v-if="!store.isAgentOnline"
        :is-logging-in="isLoggingIn"
        :login-error="loginError"
        @login="handleLogin"
      />

      <!-- Online state -->
      <template v-else>
        <ConnectionStatus
          v-if="store.status === 'connecting' || store.status === 'disconnected'"
          :type="store.status === 'connecting' ? 'connecting' : 'disconnected'"
        />

        <div class="ccsim-panel__body">
          <SessionList />

          <div class="ccsim-panel__chat">
            <!-- Chat header -->
            <ChatHeader
              v-if="store.currentSessionId"
              @close-session="handleCloseSession"
            />

            <ChatMessages
              :messages="currentMessages"
              self-role="agent"
              :typing-visible="store.visitorTyping"
              :empty-title="$t('panel.agent.emptyTitle')"
              :empty-desc="$t('panel.agent.emptyDesc')"
              :has-more-history="store.hasMoreHistory[store.currentSessionId ?? -1] ?? false"
              :history-loading="currentHistoryLoading"
              @preview-image="previewUrl = $event"
              @load-more="loadMoreHistory"
            />
            <ImagePreview
              :visible="!!previewUrl"
              :url="previewUrl || ''"
              @close="previewUrl = null"
            />

            <!-- No session selected -->
            <div v-if="!store.currentSessionId" class="ccsim-panel__no-session">
              <svg class="ccsim-panel__no-session-icon" viewBox="0 0 80 80" fill="none">
                <rect
                  x="8"
                  y="12"
                  width="64"
                  height="48"
                  rx="8"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M24 36h32M24 44h20"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <circle cx="56" cy="28" r="4" fill="currentColor" opacity="0.3" />
              </svg>
              <p>{{ $t('panel.agent.noSession') }}</p>
            </div>

            <Toolbar
              v-if="store.currentSessionId"
              :items="store.toolbarItems"
              :context="toolbarContext"
            />

            <MessageInput
              v-if="store.currentSessionId"
              :placeholder="$t('panel.agent.placeholder')"
              @send="handleSend"
            />
          </div>

          <RightPanel v-if="store.currentSessionId" />
        </div>
      </template>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { store } from '@/store/agent'
import { getInstance } from '@/agentSdk'
import ChatMessages from '@/ui/chatMessages.vue'
import MessageInput from '@/ui/messageInput.vue'
import ConnectionStatus from '@/ui/connectionStatus.vue'
import ImagePreview from '@/ui/imagePreview.vue'
import Toolbar from '@/ui/toolbar.vue'
import type { ToolbarContext } from '@/types/toolbar'
import { Role } from '@/types/sdk'
import AgentHeader from './agentHeader.vue'
import ChatHeader from './chatHeader.vue'
import OfflineState from './offlineState.vue'
import SessionList from './sessionList.vue'
import RightPanel from './rightPanel.vue'
import { useDrag } from '@/agent/useDrag'
import { useFullscreen } from '@/agent/useFullscreen'
import { useAgentLogin } from '@/agent/useAgentLogin'
import { t as $t } from '@/i18n'

const sdk = getInstance()
const panelRef = ref<HTMLElement | null>(null)
const previewUrl = ref<string | null>(null)
const { startDrag } = useDrag(panelRef)
const { isFullscreen, toggleFullscreen } = useFullscreen()
const { isLoggingIn, loginError, onLogin: handleLogin } = useAgentLogin()

function hidePanel() {
  if (!sdk) return
  sdk.hidePanel()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) toggleFullscreen()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

const currentMessages = computed(() => store.messagesMap[store.currentSessionId ?? -1] ?? [])
const currentHistoryLoading = computed(
  () => store.historyLoading[store.currentSessionId ?? -1] ?? false,
)

const toolbarContext = computed<ToolbarContext>(() => ({
  sessionId: store.currentSessionId,
  agentId: store.agentId,
  agentName: store.agentName,
  role: Role.AGENT,
}))

function handleCloseSession() {
  const id = store.currentSessionId
  if (id != null && sdk) sdk.closeSession(id)
}

const panelStyle = computed(() => {
  if (isFullscreen.value)
    return {
      position: 'fixed' as const,
      inset: '0',
      width: '100%',
      height: '100%',
      borderRadius: '0',
    }
  return {}
})

function handleSend(text: string) {
  sdk?.sendChat(text)
}

function loadMoreHistory() {
  const id = store.currentSessionId
  if (!sdk || id == null || store.historyLoading[id]) return
  const msgs = store.messagesMap[id]
  if (!msgs || !msgs.length) return
  store.historyLoading[id] = true
  sdk.requestSessionHistory(id, msgs[0].seqNum)
}
</script>

<style scoped>
.ccsim-panel--agent {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: min(900px, calc(100vw - 48px));
  height: min(660px, calc(100vh - 120px));
  background: var(--cl-bg-container);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-panel);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: var(--z-panel);
}
.ccsim-panel--fullscreen {
  border-radius: 0;
  z-index: var(--z-overlay);
}
.ccsim-panel__body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Chat area */
.ccsim-panel__chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
}

/* No session */
.ccsim-panel__no-session {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  color: var(--cl-text-disabled);
  font-size: var(--font-size-sm);
  background: var(--cl-bg-page);
}
.ccsim-panel__no-session-icon {
  width: 56px;
  height: 56px;
  color: var(--cl-gray-300);
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
