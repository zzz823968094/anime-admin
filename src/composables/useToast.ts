import { ref } from 'vue'

/**
 * Toast 提示组合式函数
 * @description 提供全局Toast提示功能，支持成功、错误、警告、信息四种类型
 */
export function useToast() {
  const toast = ref({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  let timer: ReturnType<typeof setTimeout> | null = null

  /**
   * 显示Toast提示
   * @param message - 提示消息
   * @param type - 提示类型
   * @param duration - 显示时长（毫秒）
   */
  function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', duration: number = 3000): void {
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

  /**
   * 隐藏Toast提示
   */
  function hideToast(): void {
    toast.value.show = false
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  // 便捷方法
  const success = (message: string, duration?: number) => showToast(message, 'success', duration)
  const error = (message: string, duration?: number) => showToast(message, 'error', duration)
  const warning = (message: string, duration?: number) => showToast(message, 'warning', duration)
  const info = (message: string, duration?: number) => showToast(message, 'info', duration)

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
