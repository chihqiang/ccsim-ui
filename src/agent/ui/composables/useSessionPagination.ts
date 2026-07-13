/**
 * 会话分页 composable
 * 管理会话列表的分页加载状态
 */
import { ref, watch, onUnmounted } from 'vue'
import { store } from '@/agent/store/store'
import { getInstance } from '@/agent/sdk'
import { PAGINATION_TIMEOUT } from '@/core/utils/constants'
import { t } from '@/core/i18n'

export function useSessionPagination() {
  const sdk = getInstance()
  if (!sdk) throw new Error(t('login.paginationNotInit'))
  const sdkRef = sdk

  const isLoadingMore = ref(false)
  let timeoutTimer: ReturnType<typeof setTimeout> | null = null

  function onLoadMore() {
    if (isLoadingMore.value) return
    isLoadingMore.value = true
    const nextPage = store._sessionPage + 1
    sdkRef.requestSessionList(nextPage, 50, 'active')
    // 超时保护：10 秒后如果还没收到响应，重置 loading
    timeoutTimer = setTimeout(() => {
      isLoadingMore.value = false
      timeoutTimer = null
    }, PAGINATION_TIMEOUT)
  }

  // 监听 _sessionPage 变化来重置 isLoadingMore（服务端响应到达时）
  watch(() => store._sessionPage, () => {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer)
      timeoutTimer = null
    }
    isLoadingMore.value = false
  })

  onUnmounted(() => {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer)
      timeoutTimer = null
    }
  })

  return { isLoadingMore, onLoadMore }
}
