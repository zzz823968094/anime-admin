<template>
  <div>
    <div class="page-hd">
      <div class="page-title">番剧管理</div>
    </div>

    <div class="card">
      <div class="filter-bar">
        <input
            v-model="filters.keyword"
            class="ctrl"
            placeholder="搜索番剧标题…"
            style="width:220px"
            @keydown.enter="loadAnime(1)"
        />
        <select v-model="filters.type" class="ctrl" @change="loadAnime(1)">
          <option value="">全部分类</option>
          <option value="67">🇯🇵 日韩动漫</option>
          <option value="68">🌎 欧美动漫</option>
          <option value="66">🇨🇳 中文动漫</option>
        </select>
        <button class="btn btn-primary" @click="loadAnime(1)">搜索</button>
        <button class="btn btn-ghost" @click="resetFilter">重置</button>
        <span class="total-label">{{ animeTotalLabel }}</span>
      </div>

      <table class="tbl">
        <thead>
        <tr>
          <th>ID</th>
          <th>标题</th>
          <th>分类</th>
          <th>集数</th>
          <th>评分</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="animeList.length === 0">
          <td colspan="7" style="text-align:center;padding:30px;color:var(--sub)">加载中…</td>
        </tr>
        <tr v-for="anime in animeList" :key="anime.id">
          <td style="color:var(--sub)">{{ anime.id }}</td>
          <td>{{ anime.vodName }}</td>
          <td>{{ TYPE_MAP[anime.typeId] || anime.typeId || '—' }}</td>
          <td>第 {{ anime.vodTotal }} 集</td>
          <td>{{ anime.vodScore || '—' }} ★</td>
          <td>
            <button class="btn btn-ghost btn-sm" :disabled="recrawlingIds.has(anime.id)" @click="recrawl(anime)">
              {{ recrawlingIds.has(anime.id) ? '爬取中...' : '重新爬取' }}
            </button>
            <button class="btn btn-ghost btn-sm" @click="off(anime)">下架</button>
          </td>
        </tr>
        </tbody>
      </table>

      <div class="pager">
        <button
            class="pg-btn"
            :disabled="currentPage === 1"
            @click="loadAnime(currentPage - 1)"
        >
          上一页
        </button>
        <template v-for="item in displayPages" :key="item">
          <span v-if="item === '...'" class="pg-ellipsis">...</span>
          <button
              v-else
              class="pg-btn"
              :class="{ on: currentPage === item }"
              @click="loadAnime(item)"
          >
            {{ item }}
          </button>
        </template>
        <button
            class="pg-btn"
            :disabled="currentPage === totalPages"
            @click="loadAnime(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, reactive, ref} from 'vue'
import {animeOff, getAnimeList} from '@/utils/api'
import {crawlById} from '@/api/crawler'

const TYPE_MAP = {'67': '🇯🇵 日韩', '68': '🌎 欧美', '66': '🇨🇳 中文'}

const filters = reactive({
  keyword: '',
  status: '',
  type: ''
})

const animeList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const animeTotalLabel = ref('')
const totalPages = ref(1)

// 记录正在爬取的番剧ID
const recrawlingIds = ref(new Set())

// 计算显示的页码（带省略号）
const displayPages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    // 总页数小于等于7，显示所有页码
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 总页数大于7，使用省略号
    if (current <= 4) {
      // 当前页在前面
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      // 当前页在后面
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 当前页在中间
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

const loadAnime = async (page) => {
  try {
    currentPage.value = page
    const params = {
      page,
      size: pageSize.value,
      sort: 'latest'
    }
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.status) params.status = filters.status
    if (filters.type) params.type = filters.type

    const res = await getAnimeList(params)
    animeList.value = res.data.records || []
    total.value = res.data.total || 0
    totalPages.value = Math.ceil(total.value / pageSize.value)
    animeTotalLabel.value = `共 ${total.value} 条`
  } catch (e) {
    console.error('加载番剧列表失败', e)
  }
}
const resetFilter = () => {
  filters.keyword = ''
  filters.status = ''
  filters.type = ''
  loadAnime(1)
}

// Toast 提示
const toast = reactive({
  show: false,
  message: '',
  type: 'success'
})

const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

const off = async (anime) => {
  try {
    const res = await animeOff(anime.id)
    if (res.code === 200) {
      showToast('下架成功')
      loadAnime(currentPage.value)
    } else {
      showToast(res.message || '下架失败', 'error')
    }
  } catch (e) {
    console.error('下架番剧失败', e)
    showToast('下架失败，请稍后重试', 'error')
  }
}

const recrawl = async (anime) => {
  // 添加到爬取中的集合
  recrawlingIds.value.add(anime.id)
  
  try {
    const res = await crawlById(anime.id)
    if (res.code === 200) {
      showToast('重新爬取任务已提交')
    } else {
      showToast(res.message || '重新爬取失败', 'error')
    }
  } catch (e) {
    console.error('重新爬取番剧失败', e)
    showToast('重新爬取失败，请稍后重试', 'error')
  } finally {
    // 从爬取中的集合移除
    recrawlingIds.value.delete(anime.id)
    await loadAnime(currentPage.value)
  }
}


onMounted(() => {
  loadAnime(1)
})
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.total-label {
  margin-left: auto;
  font-size: 12px;
  color: var(--sub);
}

/* Toast 提示 */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  z-index: 2000;
  animation: slideIn 0.3s ease;
  font-weight: 500;
  color: var(--text);
  font-size: 14px;
}

.toast.success {
  border-left: 4px solid #4ade80;
}

.toast.error {
  border-left: 4px solid #f87171;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
