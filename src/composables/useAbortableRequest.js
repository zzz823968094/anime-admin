import { ref, onUnmounted } from 'vue'

/**
 * 请求取消组合式函数
 * 用于防止竞态条件和内存泄漏
 */
export function useAbortableRequest() {
  const abortController = ref(null)
  const loading = ref(false)

  function createNewController() {
    // 取消之前的请求
    if (abortController.value) {
      abortController.value.abort()
    }
    
    abortController.value = new AbortController()
    return abortController.value
  }

  async function execute(asyncFn, options = {}) {
    const { 
      onError, 
      onSuccess,
      skipLoading = false 
    } = options

    const controller = createNewController()
    loading.value = !skipLoading

    try {
      const result = await asyncFn(controller.signal)
      
      if (!skipLoading) {
        loading.value = false
      }
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (error) {
      if (error.name === 'AbortError') {
        // 请求被取消，静默处理
        return null
      }

      if (!skipLoading) {
        loading.value = false
      }

      if (onError) {
        onError(error)
      }

      throw error
    }
  }

  function cancel() {
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
