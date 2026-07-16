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
      <div v-if="!store.isAgentOnline" class="ccsim-panel__offline">
        <div class="ccsim-panel__offline-card">
          <svg class="ccsim-panel__offline-icon" viewBox="0 0 80 80" fill="none">
            <rect x="8" y="12" width="64" height="48" rx="8" stroke="currentColor" stroke-width="2" />
            <path d="M24 36h32M24 44h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M40 60v8l-8-6h-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="56" cy="28" r="4" fill="currentColor" opacity="0.3" />
          </svg>
          <h3>{{ $t('panel.agent.offlineTitle') }}</h3>
          <p>{{ $t('panel.agent.offlineDesc') }}</p>
          <button
            class="ccsim-panel__online-btn"
            :disabled="isLoggingIn"
            @click="handleLogin"
          >
            <svg v-if="isLoggingIn" class="ccsim-panel__btn-spinner" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>
            <span>{{ isLoggingIn ? $t('panel.agent.loggingIn') : $t('panel.agent.onlineBtn') }}</span>
          </button>
          <p v-if="loginError" class="ccsim-panel__error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ loginError }}
          </p>
        </div>
      </div>

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
            <div v-if="store.currentSessionId" class="ccsim-panel__chat-header">
              <div class="ccsim-panel__chat-visitor-info">
                <van-image
                  v-if="currentVisitorAvatar"
                  round
                  width="28"
                  height="28"
                  :src="currentVisitorAvatar"
                />
                <div v-else class="ccsim-panel__chat-avatar-fallback">
                  {{ currentVisitorName.charAt(0) }}
                </div>
                <div>
                  <div class="ccsim-panel__chat-visitor-name">{{ currentVisitorName }}</div>
                  <div v-if="currentVisitorSource" class="ccsim-panel__chat-visitor-source">{{ currentVisitorSource }}</div>
                </div>
              </div>
              <button class="ccsim-panel__close-session" @click="handleCloseSession">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {{ $t('visitorInfo.closeSession') }}
              </button>
            </div>

            <ChatMessages
              :messages="currentMessages"
              self-role="agent"
              :typing-visible="store.visitorTyping"
              :empty-title="$t('panel.agent.emptyTitle')"
              :empty-desc="$t('panel.agent.emptyDesc')"
              :has-more-history="store._hasMoreHistory[store.currentSessionId ?? -1] ?? false"
              :history-loading="currentHistoryLoading"
              @preview-image="previewUrl = $event"
              @load-more="loadMoreHistory"
            />
            <ImagePreview :visible="!!previewUrl" :url="previewUrl || ''" @close="previewUrl = null" />

            <!-- No session selected -->
            <div v-if="!store.currentSessionId" class="ccsim-panel__no-session">
              <svg class="ccsim-panel__no-session-icon" viewBox="0 0 80 80" fill="none">
                <rect x="8" y="12" width="64" height="48" rx="8" stroke="currentColor" stroke-width="2" />
                <path d="M24 36h32M24 44h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
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
import { Image as VanImage } from 'vant'
import { store } from '@/store/agent'
import { getInstance } from '@/agentSdk'
import ChatMessages from '@/ui/chatMessages.vue'
import MessageInput from '@/ui/messageInput.vue'
import ConnectionStatus from '@/ui/connectionStatus.vue'
import ImagePreview from '@/ui/imagePreview.vue'
import Toolbar from '@/ui/toolbar.vue'
import type { ToolbarContext } from '@/types/toolbar'
import { Role } from '@/types/sdk'
import AgentHeader from './AgentHeader.vue'
import SessionList from './SessionList.vue'
import RightPanel from './RightPanel.vue'
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
const currentHistoryLoading = computed(() => store.historyLoading[store.currentSessionId ?? -1] ?? false)

const toolbarContext = computed<ToolbarContext>(() => ({
  sessionId: store.currentSessionId,
  agentId: store.agentId,
  agentName: store.agentName,
  role: Role.AGENT,
}))

const currentVisitorName = computed(() => {
  const id = store.currentSessionId
  if (id == null) return ''
  const session = store.sessions.find((s: any) => s.sessionId === id) as Record<string, any> | undefined
  if (session) return session.visitorNickname || $t('format.unknownUser')
  const waiting = store.waitingSessions.find((s: any) => s.session_id === id) as Record<string, any> | undefined
  return waiting?.visitor_nickname || $t('format.unknownUser')
})

const currentVisitorAvatar = computed(() => {
  const id = store.currentSessionId
  if (id == null) return null
  const session = store.sessions.find((s: any) => s.sessionId === id) as Record<string, any> | undefined
  if (session?.visitorAvatar) return session.visitorAvatar
  const waiting = store.waitingSessions.find((s: any) => s.session_id === id) as Record<string, any> | undefined
  if (waiting?.visitorAvatar) return waiting.visitorAvatar
  if (waiting?.visitor_avatar) return waiting.visitor_avatar
  return null
})

const currentVisitorSource = computed(() => {
  const id = store.currentSessionId
  if (id == null) return ''
  const session = store.sessions.find((s: any) => s.sessionId === id) as Record<string, any> | undefined
  if (session?.source) return session.source
  const waiting = store.waitingSessions.find((s: any) => s.session_id === id) as Record<string, any> | undefined
  return waiting?.source || ''
})

function handleCloseSession() {
  const id = store.currentSessionId
  if (id != null && sdk) sdk.closeSession(id)
}

const panelStyle = computed(() => {
  if (isFullscreen.value) return { position: 'fixed' as const, inset: '0', width: '100%', height: '100%', borderRadius: '0' }
  return {}
})

function handleSend(text: string) { sdk?.sendChat(text) }

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
.ccsim-panel__chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-2_5) var(--sp-4);
  border-bottom: 1px solid var(--cl-border-light);
  background: var(--cl-bg-container);
  flex-shrink: 0;
}
.ccsim-panel__chat-visitor-info {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}
.ccsim-panel__chat-avatar-fallback {
  width: 28px; height: 28px;
  border-radius: var(--radius-full);
  background: var(--cl-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: #fff;
  flex-shrink: 0;
}
.ccsim-panel__chat-visitor-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--cl-text-primary);
  line-height: 1.3;
}
.ccsim-panel__chat-visitor-source {
  font-size: var(--font-size-xs);
  color: var(--cl-text-tertiary);
  line-height: 1.3;
}
.ccsim-panel__close-session {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  padding: 4px 10px;
  border: 1px solid var(--cl-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--cl-text-tertiary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.ccsim-panel__close-session svg { width: 14px; height: 14px; color: var(--cl-danger); }
.ccsim-panel__close-session:hover {
  background: var(--cl-danger-bg);
  border-color: var(--cl-danger);
  color: var(--cl-danger);
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

/* Offline state */
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
