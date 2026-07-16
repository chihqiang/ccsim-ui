<template>
  <ChatWidget
    :visible="store.widgetVisible"
    :unread-count="store.unreadCount"
    @click="sdk?.showPanel()"
  />
  <VisitorPanel />
</template>

<script setup lang="ts">
import { store } from '@/store/visitor'
import { getInstance } from '@/visitorSdk'
import ChatWidget from '@/ui/chatWidget.vue'
import VisitorPanel from './VisitorPanel.vue'

const sdk = getInstance()
</script>
