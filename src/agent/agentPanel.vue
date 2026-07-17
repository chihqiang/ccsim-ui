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
          <div class="ccsim-panel__session" :style="{ width: sessionW + 'px' }">
            <SessionList />
          </div>
          <div
            class="ccsim-splitter ccsim-splitter--v"
            role="separator"
            aria-orientation="vertical"
            tabindex="0"
            @mousedown="startSessionSplit"
            @keydown="onSplitterKey('session', $event)"
          />
          <div class="ccsim-panel__chat">
            <!-- Chat header -->
            <ChatHeader v-if="store.currentSessionId" @close-session="handleCloseSession" />

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
          <template v-if="store.currentSessionId">
            <div
              class="ccsim-splitter ccsim-splitter--v"
              role="separator"
              aria-orientation="vertical"
              tabindex="0"
              @mousedown="startRightSplit"
              @keydown="onSplitterKey('right', $event)"
            />
            <div class="ccsim-panel__right" :style="{ width: rightW + 'px' }">
              <RightPanel />
            </div>
          </template>
        </div>
      </template>

      <!-- Resize handles (hidden in fullscreen) -->
      <div
        v-if="!isFullscreen"
        class="ccsim-resize ccsim-resize--right"
        @mousedown="startResize('right', $event)"
      />
      <div
        v-if="!isFullscreen"
        class="ccsim-resize ccsim-resize--bottom"
        @mousedown="startResize('bottom', $event)"
      />
      <div
        v-if="!isFullscreen"
        class="ccsim-resize ccsim-resize--corner"
        @mousedown="startResize('bottom-right', $event)"
      />
      <div
        v-if="!isFullscreen"
        class="ccsim-resize ccsim-resize--corner-left"
        @mousedown="startResize('bottom-left', $event)"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
import { useResize, loadPanelSize } from '@/agent/useResize'
import { useSplitter } from '@/agent/useSplitter'
import { useAgentLogin } from '@/agent/useAgentLogin'
import { t as $t } from '@/i18n'

const sdk = getInstance()
const panelRef = ref<HTMLElement | null>(null)
const previewUrl = ref<string | null>(null)
const { startDrag } = useDrag(panelRef)
const { isFullscreen, toggleFullscreen } = useFullscreen()
const { startResize } = useResize(panelRef)
const hasRightPanel = computed(() => !!store.currentSessionId)
const { sessionW, rightW, startSessionSplit, startRightSplit } = useSplitter(hasRightPanel)

function onSplitterKey(which: 'session' | 'right', e: KeyboardEvent) {
  const step = e.shiftKey ? 40 : 10
  if (which === 'session') {
    if (e.key === 'ArrowRight') sessionW.value = Math.min(sessionW.value + step, 400)
    else if (e.key === 'ArrowLeft') sessionW.value = Math.max(sessionW.value - step, 160)
    else return
  } else {
    if (e.key === 'ArrowLeft') rightW.value = Math.min(rightW.value + step, 400)
    else if (e.key === 'ArrowRight') rightW.value = Math.max(rightW.value - step, 160)
    else return
  }
  e.preventDefault()
}

const { isLoggingIn, loginError, onLogin: handleLogin } = useAgentLogin()

function hidePanel() {
  if (!sdk) return
  previewUrl.value = null
  sdk.hidePanel()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) toggleFullscreen()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

watch(
  () => store.panelVisible,
  (visible) => {
    if (visible) {
      nextTick(() => {
        if (panelRef.value && !isFullscreen.value) {
          const saved = loadPanelSize()
          if (saved) {
            panelRef.value.style.width = `${saved.width}px`
            panelRef.value.style.height = `${saved.height}px`
          }
        }
      })
    }
  },
  { immediate: true },
)

watch(isFullscreen, (fs) => {
  if (!fs && panelRef.value) {
    const saved = loadPanelSize()
    if (saved) {
      panelRef.value.style.width = `${saved.width}px`
      panelRef.value.style.height = `${saved.height}px`
    }
  }
})

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
  previewUrl.value = null
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
.ccsim-panel__session {
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.ccsim-panel__session :deep(.ccsim-sessions) {
  width: 100%;
}
.ccsim-panel__right {
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.ccsim-panel__right :deep(.ccsim-right-panel) {
  width: 100%;
}

/* Splitter handles */
.ccsim-splitter {
  position: relative;
  flex-shrink: 0;
  z-index: 5;
  transition: background 0.15s;
}
.ccsim-splitter--v {
  width: 4px;
  cursor: col-resize;
  background: var(--cl-border);
}
.ccsim-splitter--v:hover {
  background: rgba(99, 102, 241, 0.5);
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

/* Resize handles */
.ccsim-resize {
  position: absolute;
  z-index: 10;
  transition: background 0.15s;
}
.ccsim-resize--right {
  top: 0;
  right: -3px;
  width: 6px;
  height: 100%;
  cursor: col-resize;
}
.ccsim-resize--right:hover {
  background: rgba(0, 0, 0, 0.12);
}
.ccsim-resize--bottom {
  bottom: -3px;
  left: 0;
  width: 100%;
  height: 6px;
  cursor: row-resize;
}
.ccsim-resize--bottom:hover {
  background: rgba(0, 0, 0, 0.12);
}
.ccsim-resize--corner {
  bottom: -1px;
  right: -1px;
  width: 18px;
  height: 18px;
  cursor: nwse-resize;
}
.ccsim-resize--corner::after {
  content: '';
  position: absolute;
  bottom: 3px;
  right: 3px;
  width: 8px;
  height: 8px;
  border-right: 2px solid rgba(0, 0, 0, 0.2);
  border-bottom: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 0 0 2px 0;
  opacity: 0;
  transition: opacity 0.15s;
}
.ccsim-resize--corner:hover::after {
  opacity: 1;
}
.ccsim-resize--corner-left {
  bottom: -1px;
  left: -1px;
  width: 18px;
  height: 18px;
  cursor: nesw-resize;
}
.ccsim-resize--corner-left::after {
  content: '';
  position: absolute;
  bottom: 3px;
  left: 3px;
  width: 8px;
  height: 8px;
  border-left: 2px solid rgba(0, 0, 0, 0.2);
  border-bottom: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 0 0 0 2px;
  opacity: 0;
  transition: opacity 0.15s;
}
.ccsim-resize--corner-left:hover::after {
  opacity: 1;
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
