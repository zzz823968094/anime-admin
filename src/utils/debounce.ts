/**
 * 防抖和节流工具函数
 */

/**
 * 防抖函数
 * @param func - 要执行的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this

    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      func.apply(context, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param func - 要执行的函数
 * @param interval - 间隔时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  interval: number = 300
): (...args: Parameters<T>) => void {
  let lastTime = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this
    const now = Date.now()
    const remaining = interval - (now - lastTime)

    if (timer) {
      clearTimeout(timer)
    }

    if (remaining <= 0) {
      lastTime = now
      func.apply(context, args)
    } else {
      timer = setTimeout(() => {
        lastTime = Date.now()
        timer = null
        func.apply(context, args)
      }, remaining)
    }
  }
}

/**
 * 创建带取消功能的防抖函数
 * @param func - 要执行的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 包含防抖函数和取消方法
 */
export function debounceWithCancel<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null

  const debounced = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this

    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      func.apply(context, args)
    }, delay)
  }

  debounced.cancel = function () {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return debounced as ((...args: Parameters<T>) => void) & { cancel: () => void }
}

/**
 * 异步防抖函数（返回Promise）
 * @param asyncFunc - 异步函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的异步函数
 */
export function asyncDebounce<T extends (...args: unknown[]) => Promise<unknown>>(
  asyncFunc: T,
  delay: number = 300
): (...args: Parameters<T>) => Promise<ReturnType<T> | { cancelled: boolean }> {
  let timer: ReturnType<typeof setTimeout> | null = null
  let rejectPrevious: ((reason?: any) => void) | null = null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this

    // 拒绝上一个pending的Promise
    if (rejectPrevious) {
      rejectPrevious({ cancelled: true })
    }

    return new Promise((resolve, reject) => {
      rejectPrevious = reject

      if (timer) {
        clearTimeout(timer)
      }

      timer = setTimeout(async () => {
        rejectPrevious = null
        try {
          const result = await asyncFunc.apply(context, args)
          resolve(result as ReturnType<T> | { cancelled: boolean })
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }
}
