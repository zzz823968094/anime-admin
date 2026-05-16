import { ref, reactive } from 'vue'

/**
 * 分页组合式函数
 * @param pageSize - 每页数量
 */
export function usePagination<T = any>(pageSize: number = 10) {
  const loading = ref(false)
  const currentPage = ref(1)
  const total = ref(0)
  const list = ref<T[]>([])

  const pagination = reactive({
    current: currentPage,
    pageSize,
    total
  })

  /**
   * 加载数据
   * @param fetchFn - 获取数据的函数
   */
  async function loadData(fetchFn: (params: { page: number; pageSize: number }) => Promise<{ data: T[]; total: number }>): Promise<void> {
    loading.value = true
    try {
      const result = await fetchFn({
        page: currentPage.value,
        pageSize
      })
      list.value = result.data
      total.value = result.total
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 切换页码
   * @param page - 页码
   * @param fetchFn - 获取数据的函数
   */
  function handlePageChange(page: number, fetchFn: (params: { page: number; pageSize: number }) => Promise<{ data: T[]; total: number }>): void {
    currentPage.value = page
    loadData(fetchFn)
  }

  /**
   * 重置分页
   */
  function resetPagination(): void {
    currentPage.value = 1
    total.value = 0
    list.value = []
  }

  return {
    loading,
    currentPage,
    total,
    list,
    pagination,
    loadData,
    handlePageChange,
    resetPagination
  }
}
