<template>
  <ChatWidget
    :visible="store.widgetVisible"
    :unread-count="store.unreadCount"
    @click="sdk?.showPanel()"
  />
  <VisitorPanel />
</template>

<script setup lang="ts">
import { store } from '@/visitor/store/store'
import { getInstance } from '@/visitor/sdk'
import ChatWidget from '@/core/ui/ChatWidget.vue'
import VisitorPanel from './VisitorPanel.vue'

const sdk = getInstance()
</script>
