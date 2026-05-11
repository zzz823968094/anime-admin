import { ref } from 'vue'

/**
 * Toast 提示组合式函数
 */
export function useToast() {
  const toast = ref({
    show: false,
    message: '',
    type: 'success' // 'success' | 'error' | 'warning' | 'info'
  })

  let timer = null

  function showToast(message, type = 'success', duration = 3000) {
    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer)
    }

    toast.value = {
      show: true,
      message,
      type
    }

    timer = setTimeout(() => {
      toast.value.show = false
    }, duration)
  }

  function hideToast() {
    toast.value.show = false
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  // 便捷方法
  const success = (message, duration) => showToast(message, 'success', duration)
  const error = (message, duration) => showToast(message, 'error', duration)
  const warning = (message, duration) => showToast(message, 'warning', duration)
  const info = (message, duration) => showToast(message, 'info', duration)

  return {
    toast,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info
  }
}
