import { ref, reactive } from 'vue'

/**
 * 模态框组合式函数
 * @param defaultForm - 默认表单数据
 */
export function useModal<T extends Record<string, any> = Record<string, any>>(defaultForm: T = {} as T) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const error = ref('')

  const formData = reactive<T>({ ...defaultForm })

  /**
   * 打开模态框
   * @param editMode - 是否为编辑模式
   * @param data - 表单数据
   */
  function open(editMode = false, data: Partial<T> | null = null): void {
    isEdit.value = editMode
    error.value = ''

    if (editMode && data) {
      Object.assign(formData, data)
    } else {
      resetForm()
    }

    visible.value = true
  }

  /**
   * 关闭模态框
   */
  function close(): void {
    visible.value = false
    resetForm()
    error.value = ''
  }

  /**
   * 重置表单
   */
  function resetForm(): void {
    Object.keys(formData).forEach((key) => {
      if (key in defaultForm) {
        (formData as Record<string, unknown>)[key] = (defaultForm as Record<string, unknown>)[key]
      }
    })
  }

  /**
   * 提交表单
   * @param submitFn - 提交函数
   */
  async function submit(submitFn: (data: T) => Promise<void>): Promise<boolean> {
    submitting.value = true
    error.value = ''

    try {
      await submitFn(formData as T)
      close()
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '操作失败'
      error.value = errorMessage
      return false
    } finally {
      submitting.value = false
    }
  }

  return {
    visible,
    isEdit,
    submitting,
    error,
    formData,
    open,
    close,
    resetForm,
    submit
  }
}
