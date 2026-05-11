import { ref, reactive } from 'vue'

/**
 * 模态框组合式函数
 * @param {Object} defaultForm - 默认表单数据
 */
export function useModal(defaultForm = {}) {
  const visible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const error = ref('')

  const formData = reactive({ ...defaultForm })

  function open(editMode = false, data = null) {
    isEdit.value = editMode
    error.value = ''
    
    if (editMode && data) {
      Object.assign(formData, data)
    } else {
      resetForm()
    }
    
    visible.value = true
  }

  function close() {
    visible.value = false
    resetForm()
    error.value = ''
  }

  function resetForm() {
    Object.keys(formData).forEach(key => {
      if (key in defaultForm) {
        formData[key] = defaultForm[key]
      }
    })
  }

  async function submit(submitFn) {
    submitting.value = true
    error.value = ''
    
    try {
      await submitFn(formData)
      close()
      return true
    } catch (e) {
      error.value = e.message || '操作失败'
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
