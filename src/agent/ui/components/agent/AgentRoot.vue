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
import { store } from '@/agent/store/store'
import { getInstance } from '@/agent/sdk'
import ChatWidget from '@/core/ui/ChatWidget.vue'
import AgentPanel from './AgentPanel.vue'

const sdk = getInstance()
</script>
