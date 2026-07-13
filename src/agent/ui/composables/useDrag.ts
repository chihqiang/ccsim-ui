import { ref, onUnmounted } from 'vue'

export function useDrag(panelRef: { value: HTMLElement | null }) {
  const isDragging = ref(false)
  let onMove: ((ev: MouseEvent) => void) | null = null
  let onUp: (() => void) | null = null

  function startDrag(e: MouseEvent) {
    if (!panelRef.value) return
    isDragging.value = true
    const rect = panelRef.value.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    onMove = (ev: MouseEvent) => {
      if (!panelRef.value) return
      panelRef.value.style.left = `${ev.clientX - offsetX}px`
      panelRef.value.style.top = `${ev.clientY - offsetY}px`
      panelRef.value.style.right = 'auto'
      panelRef.value.style.bottom = 'auto'
    }
    onUp = () => {
      isDragging.value = false
      document.removeEventListener('mousemove', onMove!)
      document.removeEventListener('mouseup', onUp!)
      onMove = null
      onUp = null
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  onUnmounted(() => {
    if (onMove) document.removeEventListener('mousemove', onMove)
    if (onUp) document.removeEventListener('mouseup', onUp)
  })

  return { isDragging, startDrag }
}
