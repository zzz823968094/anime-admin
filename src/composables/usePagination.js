import { ref, computed } from 'vue'
import { PAGINATION } from '@/constants'

/**
 * 分页组合式函数
 * @param {Function} fetchFn - 数据获取函数
 * @param {Object} options - 配置选项
 */
export function usePagination(fetchFn, options = {}) {
  const {
    initialPage = PAGINATION.DEFAULT_PAGE_NUM,
    initialPageSize = PAGINATION.DEFAULT_PAGE_SIZE
  } = options

  const currentPage = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const total = ref(0)
  const data = ref([])
  const loading = ref(false)
  const error = ref(null)

  const totalPages = computed(() => {
    if (!total.value) return 1
    return Math.ceil(total.value / pageSize.value)
  })

  const isEmpty = computed(() => !loading.value && data.value.length === 0)

  async function loadData(page = currentPage.value) {
    loading.value = true
    error.value = null
    
    try {
      const res = await fetchFn({
        pageNum: page,
        pageSize: pageSize.value
      })
      
      data.value = res.data?.records || []
      total.value = res.data?.total || 0
      currentPage.value = page
      
      // 确保当前页不超过总页数
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value
        if (currentPage.value !== page) {
          await loadData(currentPage.value)
        }
      }
    } catch (e) {
      error.value = e
      console.error('加载数据失败:', e)
    } finally {
      loading.value = false
    }
  }

  function goToPage(page) {
    if (page < 1 || page > totalPages.value || page === currentPage.value) {
      return
    }
    loadData(page)
  }

  function changePageSize(newSize) {
    pageSize.value = newSize
    currentPage.value = 1
    loadData(1)
  }

  function refresh() {
    loadData(currentPage.value)
  }

  function reset() {
    currentPage.value = initialPage
    pageSize.value = initialPageSize
    total.value = 0
    data.value = []
    error.value = null
  }

  return {
    currentPage,
    pageSize,
    total,
    totalPages,
    data,
    loading,
    error,
    isEmpty,
    loadData,
    goToPage,
    changePageSize,
    refresh,
    reset
  }
}
