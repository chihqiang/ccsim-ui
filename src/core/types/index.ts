// Core types entry point
export type { ServerMessage } from './serverMessage'
export { ServerMessageTypeEnum } from './serverMessage'

// LogLevel is shared across both SDKs
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SILENT = 'silent',
}
