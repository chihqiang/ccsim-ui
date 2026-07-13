<template>
  <van-image-preview
    v-model:show="show"
    :images="[url]"
    :closeable="true"
    teleport="body"
    @close="$emit('close')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ImagePreview as VanImagePreview } from 'vant'

const props = defineProps<{ visible: boolean; url: string }>()
const emit = defineEmits<{ close: [] }>()

const show = computed({
  get: () => props.visible,
  set: (v) => { if (!v) emit('close') },
})
</script>
