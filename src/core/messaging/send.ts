/** 共享消息发送基础：SendState、计时器管理 */

export interface SendState {
  tempIdToTimer: Map<string, ReturnType<typeof setTimeout>>
  lastSendTime: number
}

export function createSendState(): SendState {
  return { tempIdToTimer: new Map(), lastSendTime: 0 }
}

export function cancelOptimisticTimer(state: SendState, tempId: string) {
  const timer = state.tempIdToTimer.get(tempId)
  if (!timer) return
  clearTimeout(timer)
  state.tempIdToTimer.delete(tempId)
}

export function clearAllTimers(state: SendState) {
  for (const timer of state.tempIdToTimer.values()) clearTimeout(timer)
  state.tempIdToTimer.clear()
  state.lastSendTime = 0
}
