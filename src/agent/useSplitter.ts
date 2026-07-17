import { ref } from 'vue'

const DEFAULT_SESSION = 260
const DEFAULT_RIGHT = 220
const MIN_SESSION = 160
const MIN_RIGHT = 160

export function useSplitter(hasRightPanel: { value: boolean }) {
  const sessionW = ref(DEFAULT_SESSION)
  const rightW = ref(DEFAULT_RIGHT)

  function startSessionSplit(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startW = sessionW.value

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX
      sessionW.value = Math.min(Math.max(startW + delta, MIN_SESSION), 400)
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  function startRightSplit(e: MouseEvent) {
    if (!hasRightPanel.value) return
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startW = rightW.value

    const onMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX
      rightW.value = Math.min(Math.max(startW + delta, MIN_RIGHT), 400)
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return { sessionW, rightW, startSessionSplit, startRightSplit }
}
