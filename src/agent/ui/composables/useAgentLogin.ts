/**
 * Agent 登录 composable
 * 管理登录流程：超时控制、事件监听、清理
 */
import { ref, watch, onUnmounted } from 'vue'
import { getInstance } from '@/agent/sdk'
import { LOGIN_TIMEOUT } from '@/core/utils/constants'
import { logger } from '@/core/utils/logger'
import { t } from '@/core/i18n'

export function useAgentLogin() {
  const sdk = getInstance()
  if (!sdk) throw new Error(t('login.sdkNotInit'))

  const isLoggingIn = ref(false)
  const loginError = ref('')
  const sdkRef = sdk  // 窄化类型，后续不需要判空

  let loginTimer: ReturnType<typeof setTimeout> | null = null
  let loginCleanup: (() => void) | null = null

  function onLogin() {
    if (isLoggingIn.value || !sdkRef.agentOptions) return
    const { account, password } = sdkRef.agentOptions
    if (!account || !password) return
    isLoggingIn.value = true
    loginError.value = ''
    sdkRef.resetAgentOnlineSent()

    logger.debug(`useAgentLogin: 开始登录, account=${account}`)
    let settled = false

    // 监听 isAgentOnline 变化：当 store.isAgentOnline 变为 true 时认为登录成功
    // 这比监听 agentStatus 事件更精确，因为 agentStatus 可能由其他 agent 触发
    const watchDisposer = watch(
      () => sdkRef.getStore().isAgentOnline,
      (online) => {
        if (settled || !online) return
        logger.debug(`useAgentLogin: 登录成功检测到 isAgentOnline=true`)
        settled = true
        isLoggingIn.value = false
        clearTimeout(timer)
        watchDisposer()
        loginTimer = null
        loginCleanup = null

        loginError.value = ''
        sdkRef.requestSessionList(1, 50, 'active')
        sdkRef.requestWaitingSessionList()
      },
    )

    const timer = setTimeout(() => {
      if (settled) return
      logger.debug(`useAgentLogin: 登录超时 (${LOGIN_TIMEOUT}ms)`)
      settled = true
      isLoggingIn.value = false
      loginError.value = t('login.timeout')
      watchDisposer()
      loginTimer = null
      loginCleanup = null
    }, LOGIN_TIMEOUT)

    loginTimer = timer
    loginCleanup = () => {
      clearTimeout(timer)
      watchDisposer()
    }
    sdkRef.setAgentOnline()

    // 检查当前 isAgentOnline 是否已为 true（例如多 tab 场景）
    if (sdkRef.getStore().isAgentOnline) {
      logger.debug('useAgentLogin: isAgentOnline already true, login succeeded immediately')
      settled = true
      isLoggingIn.value = false
      clearTimeout(timer)
      watchDisposer()
      loginTimer = null
      loginCleanup = null
      loginError.value = ''
      sdkRef.requestSessionList(1, 50, 'active')
      sdkRef.requestWaitingSessionList()
    }
  }

  onUnmounted(() => {
    if (loginTimer) {
      clearTimeout(loginTimer)
      loginTimer = null
    }
    if (loginCleanup) {
      loginCleanup()
      loginCleanup = null
    }
  })

  return { isLoggingIn, loginError, onLogin }
}
