const MAX_SEEN_MSG_IDS = 10000
const EVICT_BATCH = MAX_SEEN_MSG_IDS / 2
const seenMsgRingBuf: (number | undefined)[] = new Array(MAX_SEEN_MSG_IDS)
let seenMsgRingPos = 0
let seenMsgCount = 0
const seenMsgIds = new Set<number>()

export function registerSeenMsgId(msgId: number) {
  if (seenMsgCount >= MAX_SEEN_MSG_IDS) {
    for (let i = 0; i < EVICT_BATCH; i++) {
      const pos = (seenMsgRingPos + i) % MAX_SEEN_MSG_IDS
      const old = seenMsgRingBuf[pos]
      if (old !== undefined) { seenMsgIds.delete(old); seenMsgRingBuf[pos] = undefined }
    }
    seenMsgRingPos = (seenMsgRingPos + EVICT_BATCH) % MAX_SEEN_MSG_IDS
    seenMsgCount -= EVICT_BATCH
  }
  const prev = seenMsgRingBuf[seenMsgRingPos]
  if (prev !== undefined) seenMsgIds.delete(prev)
  seenMsgIds.add(msgId)
  seenMsgRingBuf[seenMsgRingPos] = msgId
  seenMsgRingPos = (seenMsgRingPos + 1) % MAX_SEEN_MSG_IDS
  seenMsgCount++
}

export function isMsgIdSeen(msgId: number): boolean { return seenMsgIds.has(msgId) }
export function clearSeenMsgIds() {
  seenMsgIds.clear()
  seenMsgRingBuf.fill(undefined)
  seenMsgRingPos = 0
  seenMsgCount = 0
}
