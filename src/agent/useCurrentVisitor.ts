import { computed } from 'vue'
import { store } from '@/store/agent'
import { t } from '@/i18n'

export function useCurrentVisitor() {
  const currentVisitorName = computed(() => {
    const id = store.currentSessionId
    if (id == null) return ''
    const session = store.sessions.find((s: any) => s.sessionId === id) as
      Record<string, any> | undefined
    if (session) return session.visitorNickname || t('format.unknownUser')
    const waiting = store.waitingSessions.find((s: any) => s.session_id === id) as
      Record<string, any> | undefined
    return waiting?.visitor_nickname || t('format.unknownUser')
  })

  const currentVisitorAvatar = computed(() => {
    const id = store.currentSessionId
    if (id == null) return null
    const session = store.sessions.find((s: any) => s.sessionId === id) as
      Record<string, any> | undefined
    if (session?.visitorAvatar) return session.visitorAvatar
    const waiting = store.waitingSessions.find((s: any) => s.session_id === id) as
      Record<string, any> | undefined
    if (waiting?.visitorAvatar) return waiting.visitorAvatar
    if (waiting?.visitor_avatar) return waiting.visitor_avatar
    return null
  })

  const currentVisitorSource = computed(() => {
    const id = store.currentSessionId
    if (id == null) return ''
    const session = store.sessions.find((s: any) => s.sessionId === id) as
      Record<string, any> | undefined
    if (session?.source) return session.source
    const waiting = store.waitingSessions.find((s: any) => s.session_id === id) as
      Record<string, any> | undefined
    return waiting?.source || ''
  })

  return {
    currentVisitorName,
    currentVisitorAvatar,
    currentVisitorSource,
  }
}
