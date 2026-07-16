import { ref } from 'vue'

export function useFullscreen() {
  const isFullscreen = ref(false)
  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value
  }
  return { isFullscreen, toggleFullscreen }
}
