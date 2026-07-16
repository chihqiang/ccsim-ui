import { createApp } from 'vue'
import type { App } from 'vue'
import { resetStore } from '@/store/visitor'
import i18n from '@/i18n'
import VisitorRoot from './visitorRoot.vue'
import 'vant/lib/index.css'
import designTokens from '@/ui/tokens.css?inline'

let injected = false
function injectCSS() {
  if (injected) return
  injected = true
  const style = document.createElement('style')
  style.textContent = designTokens
  document.head.appendChild(style)
}

let vueApp: App | null = null

export function mountApp() {
  injectCSS()
  unmountApp()
  const container = document.createElement('div')
  container.id = 'ccsim-sdk-root'
  document.body.appendChild(container)
  vueApp = createApp(VisitorRoot)
  vueApp.use(i18n)
  vueApp.mount(container)
}

export function unmountApp() {
  vueApp?.unmount()
  document.getElementById('ccsim-sdk-root')?.remove()
  vueApp = null
  resetStore()
}
