<template>
  <ChatWidget
    :visible="store.widgetVisible"
    :is-agent="true"
    :unread-count="store.unreadCount"
    @click="sdk?.showPanel()"
  />
  <AgentPanel />
</template>

<script setup lang="ts">
import { store } from '@/store/agent'
import { getInstance } from '@/agentSdk'
import ChatWidget from '@/ui/chatWidget.vue'
import AgentPanel from './agentPanel.vue'

const sdk = getInstance()
</script>
