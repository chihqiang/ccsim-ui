import { reactive } from 'vue'

export interface SatisfactionState {
  showRateCard: boolean
  rateCardSessionId: number | null
}

const state = reactive<SatisfactionState>({
  showRateCard: false,
  rateCardSessionId: null,
})

export function showRate(sessionId?: number | null) {
  if (sessionId != null) state.rateCardSessionId = sessionId
  state.showRateCard = true
}

export function hideRate() {
  state.showRateCard = false
  state.rateCardSessionId = null
}

export { state as satisfactionState }
