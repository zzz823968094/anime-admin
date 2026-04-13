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
        <select v-model="filters.status" class="ctrl" @change="loadAnime(1)">
          <option value="">全部状态</option>
          <option value="1">连载中</option>
          <option value="2">已完结</option>
          <option value="0">已下线</option>
        </select>
        <select v-model="filters.type" class="ctrl" @change="loadAnime(1)">
          <option value="">全部分类</option>
          <option value="25">🇯🇵 日本动漫</option>
          <option value="26">🌎 欧美动漫</option>
          <option value="24">🇨🇳 中国动漫</option>
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
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="animeList.length === 0">
            <td colspan="7" style="text-align:center;padding:30px;color:var(--sub)">加载中…</td>
          </tr>
          <tr v-for="anime in animeList" :key="anime.id">
            <td style="color:var(--sub)">{{ anime.id }}</td>
            <td>{{ anime.title }}</td>
            <td>{{ TYPE_MAP[anime.type] || anime.type || '—' }}</td>
            <td>第 {{ anime.currentEpisode }} 集</td>
            <td>{{ anime.score || '—' }}</td>
            <td><span :class="['badge', STATUS_MAP[anime.status]?.[1] || 'b-gray']">{{ STATUS_MAP[anime.status]?.[0] || '未知' }}</span></td>
            <td>
              <button class="btn btn-ghost btn-sm" @click="viewAnime(anime)">查看</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pager">
        <button 
          v-for="page in totalPages" 
          :key="page"
          class="pg-btn"
          :class="{ on: currentPage === page }"
          @click="loadAnime(page)"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAnimeList } from '@/utils/api'

const TYPE_MAP = { '25': '🇯🇵 日本', '26': '🌎 欧美', '24': '🇨🇳 中国' }
const STATUS_MAP = { 0: ['已下线', 'b-red'], 1: ['连载中', 'b-green'], 2: ['已完结', 'b-blue'] }

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

const viewAnime = (anime) => {
  window.open(`/detail.html?id=${anime.id}`, '_blank')
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
</style>
