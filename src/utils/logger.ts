export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SILENT = 'silent',
}

export class Logger {
  private logLevel: LogLevel
  private prefix: string
  private static readonly LEVEL_PRIORITY: Record<LogLevel, number> = {
    [LogLevel.SILENT]: 0,
    [LogLevel.ERROR]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.INFO]: 3,
    [LogLevel.DEBUG]: 4,
  }

  constructor(logLevel: LogLevel = LogLevel.INFO, prefix = '[Ccsim]') {
    this.logLevel = logLevel
    this.prefix = prefix
  }

  setLogLevel(level: LogLevel) { this.logLevel = level }

  debug(...args: unknown[]) {
    if (this.shouldLog(LogLevel.DEBUG)) console.debug(this.prefix, '[DEBUG]', ...args)
  }

  info(...args: unknown[]) {
    if (this.shouldLog(LogLevel.INFO)) console.info(this.prefix, '[INFO]', ...args)
  }

  warn(...args: unknown[]) {
    if (this.shouldLog(LogLevel.WARN)) console.warn(this.prefix, '[WARN]', ...args)
  }

  error(...args: unknown[]) {
    if (this.shouldLog(LogLevel.ERROR)) console.error(this.prefix, '[ERROR]', ...args)
  }

  private shouldLog(level: LogLevel): boolean {
    return Logger.LEVEL_PRIORITY[this.logLevel] >= Logger.LEVEL_PRIORITY[level]
  }
}

export const logger = new Logger()
