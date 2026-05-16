/**
 * 错误处理与日志规范
 * @module utils/logger
 * @description 统一的错误处理和日志记录工具
 */

// 日志级别枚举
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// 日志配置
interface LogConfig {
  enableDebug: boolean
  enableConsole: boolean
  enableReport: boolean
}

// 默认配置
const defaultConfig: LogConfig = {
  enableDebug: import.meta.env.DEV,
  enableConsole: true,
  enableReport: import.meta.env.PROD
}

let config: LogConfig = { ...defaultConfig }

/**
 * 格式化日志消息
 */
function formatMessage(level: LogLevel, message: string, ...args: any[]): string {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level}]`
  return args.length > 0 ? `${prefix} ${message}` : `${prefix} ${message}`
}

/**
 * 输出日志到控制台
 */
function logToConsole(level: LogLevel, message: string, ...args: any[]): void {
  if (!config.enableConsole) return

  const formattedMessage = formatMessage(level, message)

  switch (level) {
    case LogLevel.DEBUG:
      if (config.enableDebug) {
        console.debug(formattedMessage, ...args)
      }
      break
    case LogLevel.INFO:
      console.info(formattedMessage, ...args)
      break
    case LogLevel.WARN:
      console.warn(formattedMessage, ...args)
      break
    case LogLevel.ERROR:
      console.error(formattedMessage, ...args)
      break
  }
}

/**
 * 报告错误到监控系统（生产环境）
 */
function reportError(error: Error, context?: Record<string, any>): void {
  if (!config.enableReport) return

  // TODO: 集成错误监控服务（如 Sentry）
  // Sentry.captureException(error, { extra: context })
  console.error('[Error Report]', error, context)
}

/**
 * Logger 类
 */
class Logger {
  /**
   * Debug 级别日志（仅开发环境）
   */
  debug(message: string, ...args: any[]): void {
    logToConsole(LogLevel.DEBUG, message, ...args)
  }

  /**
   * Info 级别日志
   */
  info(message: string, ...args: any[]): void {
    logToConsole(LogLevel.INFO, message, ...args)
  }

  /**
   * Warn 级别日志
   */
  warn(message: string, ...args: any[]): void {
    logToConsole(LogLevel.WARN, message, ...args)
  }

  /**
   * Error 级别日志
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    logToConsole(LogLevel.ERROR, message, error, context)

    // 生产环境报告错误
    if (error && config.enableReport) {
      reportError(error, context)
    }
  }
}

// 导出单例
export const logger = new Logger()

/**
 * 更新日志配置
 */
export function updateLogConfig(newConfig: Partial<LogConfig>): void {
  config = { ...config, ...newConfig }
}

/**
 * 统一错误处理
 */
export function handleError(
  error: unknown,
  defaultMessage: string = '操作失败',
  context?: Record<string, any>
): Error {
  const errorMessage = error instanceof Error ? error.message : defaultMessage
  const errorObj = error instanceof Error ? error : new Error(errorMessage)

  logger.error(defaultMessage, errorObj, context)

  return errorObj
}

/**
 * API 错误处理
 */
export function handleApiError(
  error: unknown,
  apiName: string
): Error {
  const context = { api: apiName }

  if (error instanceof Error) {
    logger.error(`API调用失败: ${apiName}`, error, context)
    return error
  }

  const errorObj = new Error(`${apiName} 调用失败`)
  logger.error(`API调用失败: ${apiName}`, errorObj, context)
  return errorObj
}

export default logger
