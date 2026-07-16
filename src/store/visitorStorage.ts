import { v4 as uuidv4 } from 'uuid'
import { logger } from '@/utils/logger'

const KEY_VISITOR_UUID = 'ccsim_visitor_uuid'
const KEY_SESSION_ID = 'ccsim_session_id'

function isLocalStorageAvailable(): boolean {
  try {
    localStorage.setItem('__ccsim_test__', '1')
    localStorage.removeItem('__ccsim_test__')
    return true
  } catch {
    logger.warn('visitorStorage: localStorage not available')
    return false
  }
}

function safeSet(key: string, value: string): void {
  try { localStorage.setItem(key, value) } catch { logger.warn('visitorStorage: localStorage write failed', key) }
}

export function resolveVisitorUUID(userProvided?: string): string {
  const storageAvailable = isLocalStorageAvailable()

  if (storageAvailable) {
    const stored = localStorage.getItem(KEY_VISITOR_UUID)
    if (stored) return stored
  } else {
    try {
      const stored = sessionStorage.getItem(KEY_VISITOR_UUID)
      if (stored) return stored
    } catch { logger.warn('visitorStorage: sessionStorage read failed') }
  }

  if (userProvided) {
    if (storageAvailable) { safeSet(KEY_VISITOR_UUID, userProvided) }
    else { try { sessionStorage.setItem(KEY_VISITOR_UUID, userProvided) } catch { logger.warn('visitorStorage: sessionStorage write failed') } }
    return userProvided
  }

  const generated = uuidv4()
  if (storageAvailable) { safeSet(KEY_VISITOR_UUID, generated) }
  else { try { sessionStorage.setItem(KEY_VISITOR_UUID, generated) } catch { logger.warn('visitorStorage: sessionStorage write failed') } }
  return generated
}

export function saveSessionId(sessionId: number): void {
  safeSet(KEY_SESSION_ID, String(sessionId))
}

export function loadSessionId(): number | null {
  try {
    const stored = localStorage.getItem(KEY_SESSION_ID) ?? sessionStorage.getItem(KEY_SESSION_ID)
    if (stored) {
      const id = parseInt(stored, 10)
      return isNaN(id) ? null : id
    }
  } catch { logger.warn('visitorStorage: load sessionId failed') }
  return null
}

export function clearSessionId(): void {
  try { localStorage.removeItem(KEY_SESSION_ID) } catch { logger.warn('visitorStorage: clear sessionId failed') }
}
