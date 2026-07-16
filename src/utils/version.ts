declare const __SDK_VERSION__: string

export const SDK_VERSION = __SDK_VERSION__

import { logger } from './logger'

export function logVersion() {
  logger.info(`Version: ${SDK_VERSION}`)
}
