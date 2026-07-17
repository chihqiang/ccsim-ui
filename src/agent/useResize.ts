import { ref, onUnmounted } from 'vue'

export type ResizeDirection = 'right' | 'bottom' | 'bottom-right' | 'bottom-left'

const STORAGE_KEY = 'ccsim_agent_panel_size'
const MIN_WIDTH = 400
const MIN_HEIGHT = 300

export interface PanelSize {
  width: number
  height: number
}

export function loadPanelSize(): PanelSize | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const { width, height } = JSON.parse(raw)
    if (typeof width === 'number' && typeof height === 'number') {
      return {
        width: Math.min(width, window.innerWidth - 120),
        height: Math.min(height, window.innerHeight - 120),
      }
    }
  } catch {}
  return null
}

export function useResize(panelRef: { value: HTMLElement | null }) {
  const isResizing = ref(false)
  let cleanup: (() => void) | null = null

  function saveSize(w: number, h: number) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ width: w, height: h }))
    } catch {}
  }

  function startResize(direction: ResizeDirection, e: MouseEvent) {
    if (!panelRef.value) return
    e.preventDefault()
    e.stopPropagation()
    isResizing.value = true

    const panel = panelRef.value
    const startX = e.clientX
    const startY = e.clientY
    const startW = panel.offsetWidth
    const startH = panel.offsetHeight
    const startLeft = panel.offsetLeft
    const startTop = panel.offsetTop

    const maxW = window.innerWidth - startLeft - 24
    const maxH = window.innerHeight - startTop - 24

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY

      if (direction === 'right' || direction === 'bottom-right') {
        const w = Math.min(Math.max(startW + dx, MIN_WIDTH), maxW)
        panel.style.width = `${w}px`
      }
      if (direction === 'bottom-left') {
        const newW = startW - dx
        if (newW >= MIN_WIDTH && newW <= startLeft + startW) {
          panel.style.width = `${newW}px`
          panel.style.left = `${startLeft + dx}px`
        }
      }
      if (direction === 'bottom' || direction === 'bottom-right' || direction === 'bottom-left') {
        const h = Math.min(Math.max(startH + dy, MIN_HEIGHT), maxH)
        panel.style.height = `${h}px`
      }
    }

    const onUp = () => {
      isResizing.value = false
      saveSize(panel.offsetWidth, panel.offsetHeight)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      cleanup = null
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)

    cleanup = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      cleanup = null
    }
  }

  onUnmounted(() => cleanup?.())

  return { isResizing, startResize }
}
