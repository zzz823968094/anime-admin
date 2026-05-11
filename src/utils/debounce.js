/**
 * 防抖和节流工具函数
 */

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay = 300) {
  let timer = null

  return function (...args) {
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
 * @param {Function} func - 要执行的函数
 * @param {number} interval - 间隔时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, interval = 300) {
  let lastTime = 0
  let timer = null

  return function (...args) {
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
 * @param {Function} func - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Object} 包含防抖函数和取消方法
 */
export function debounceWithCancel(func, delay = 300) {
  let timer = null

  const debounced = function (...args) {
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

  return debounced
}

/**
 * 异步防抖函数（返回Promise）
 * @param {Function} asyncFunc - 异步函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的异步函数
 */
export function asyncDebounce(asyncFunc, delay = 300) {
  let timer = null
  let rejectPrevious = null

  return function (...args) {
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
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }
}
