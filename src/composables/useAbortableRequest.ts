import { ref, onUnmounted } from 'vue'

/**
 * 可中止请求组合式函数
 * @description 用于防止竞态条件和内存泄漏，支持请求取消
 */
export function useAbortableRequest() {
  const abortController = ref<AbortController | null>(null)
  const loading = ref(false)

  /**
   * 创建新的AbortController
   * @returns AbortController实例
   */
  function createNewController(): AbortController {
    // 取消之前的请求
    if (abortController.value) {
      abortController.value.abort()
    }

    const controller = new AbortController()
    abortController.value = controller
    return controller
  }

  /**
   * 执行异步请求
   * @param asyncFn - 异步函数
   * @param options - 配置选项
   * @returns Promise<any>
   */
  async function execute<T = any>(
    asyncFn: (signal: AbortSignal) => Promise<T>,
    options: {
      onError?: (error: Error) => void
      onSuccess?: (result: T) => void
      skipLoading?: boolean
    } = {}
  ): Promise<T | null> {
    const { onError, onSuccess, skipLoading = false } = options

    createNewController()
    loading.value = !skipLoading

    try {
      const result = await asyncFn(abortController.value!.signal)

      if (!skipLoading) {
        loading.value = false
      }

      if (onSuccess) {
        onSuccess(result)
      }

      return result
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // 请求被取消，静默处理
        return null
      }

      if (!skipLoading) {
        loading.value = false
      }

      if (onError) {
        const errorObj = error instanceof Error ? error : new Error(String(error))
        onError(errorObj)
      }

      throw error
    }
  }

  /**
   * 取消当前请求
   */
  function cancel(): void {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
      loading.value = false
    }
  }

  // 组件卸载时自动取消请求
  onUnmounted(() => {
    cancel()
  })

  return {
    loading,
    execute,
    cancel
  }
}
