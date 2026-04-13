<template>
  <div>
    <div class="page-hd">
      <div class="page-title">🔍 搜索统计</div>
      <button class="btn btn-ghost" @click="loadSearchStats">🔄 刷新</button>
    </div>

    <div class="stats-grid-2">
      <!-- 热门搜索词 -->
      <div class="card">
        <div class="sec-title">热门搜索词 TOP 20</div>
        <div v-if="hotKeywords.length" class="keywords-list">
          <div v-for="(keyword, index) in hotKeywords" :key="index" class="keyword-item">
            <span class="keyword-rank">{{ index + 1 }}</span>
            <span class="keyword-text">{{ keyword.keyword }}</span>
            <div class="keyword-bar">
              <div 
                class="keyword-bar-fill" 
                :style="{ width: getKeywordPercent(keyword.cnt) + '%' }"
              ></div>
            </div>
            <span class="keyword-count">{{ keyword.cnt }}</span>
          </div>
        </div>
        <div v-else class="loading-text">暂无搜索数据</div>
      </div>

      <!-- 统计概览 -->
      <div class="card">
        <div class="sec-title">搜索概览</div>
        <div class="overview-stats">
          <div class="overview-card">
            <div class="overview-value">{{ (searchData.totalSearches || 0).toLocaleString() }}</div>
            <div class="overview-label">累计搜索次数</div>
          </div>
          <div class="overview-card">
            <div class="overview-value accent">{{ hotKeywords.length }}</div>
            <div class="overview-label">不同关键词数</div>
          </div>
          <div v-if="searchData.avgPerDay" class="overview-card">
            <div class="overview-value">{{ Math.round(searchData.avgPerDay) }}</div>
            <div class="overview-label">日均搜索次数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近搜索记录 -->
    <div class="card">
      <div class="sec-title">最近搜索记录</div>
      <table class="tbl">
        <thead>
          <tr>
            <th>关键词</th>
            <th>用户</th>
            <th>IP</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="recentSearches.length === 0">
            <td colspan="4" style="text-align:center;padding:30px;color:var(--sub)">加载中…</td>
          </tr>
          <tr v-for="(search, index) in recentSearches" :key="index">
            <td>{{ search.keyword }}</td>
            <td>{{ search.username || '游客' }}</td>
            <td style="color:var(--sub)">{{ search.ip }}</td>
            <td style="color:var(--sub)">{{ formatTime(search.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getSearchStats } from '@/utils/api'

const searchData = reactive({
  totalSearches: 0,
  avgPerDay: 0
})

const hotKeywords = ref([])
const recentSearches = ref([])

const getKeywordPercent = (count) => {
  if (!hotKeywords.value.length) return 0
  const max = hotKeywords.value[0].cnt
  return Math.round((count / max) * 100)
}

const formatTime = (time) => {
  if (!time) return '—'
  return new Date(time).toLocaleString('zh-CN')
}

const loadSearchStats = async () => {
  try {
    const res = await getSearchStats({ limit: 20, days: 7 })
    const data = res.data
    hotKeywords.value = data.hotKeywords || []
    recentSearches.value = data.recentSearches || []
    searchData.totalSearches = data.totalSearches || 0
    searchData.avgPerDay = data.avgPerDay || 0
  } catch (e) {
    console.error('加载搜索统计失败', e)
  }
}

onMounted(() => {
  loadSearchStats()
})
</script>

<style scoped>
.stats-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.keywords-list {
  display: flex;
  flex-direction: column;
}

.keyword-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid var(--border);
}

.keyword-rank {
  width: 22px;
  text-align: center;
  font-size: 12px;
  color: var(--sub);
}

.keyword-text {
  flex: 1;
  font-size: 13px;
  color: var(--text);
}

.keyword-bar {
  width: 80px;
  height: 4px;
  background: var(--bg3);
  border-radius: 2px;
  overflow: hidden;
}

.keyword-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  border-radius: 2px;
}

.keyword-count {
  font-size: 12px;
  color: var(--sub);
  width: 36px;
  text-align: right;
}

.overview-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.overview-card {
  background: var(--bg3);
  border-radius: 10px;
  padding: 16px;
  text-align: center;
}

.overview-value {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.overview-value.accent {
  color: var(--accent2);
}

.overview-label {
  font-size: 12px;
  color: var(--sub);
  margin-top: 4px;
}

.loading-text {
  text-align: center;
  padding: 20px;
  color: var(--sub);
}
</style>
