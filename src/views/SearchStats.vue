<template>
  <div class="search-stats">
    <el-card shadow="never" class="stats-card">
      <template #header>
        <div class="card-header">
          <el-row :gutter="20">
            <el-col :span="8">门搜索词 TOP 20</el-col>
            <el-col :span="8"> 累计搜索次数:{{ searchData.totalSearches }}</el-col>
            <el-col :span="8">不同关键词数:{{ searchData.totalKeywordsCount }}</el-col>
          </el-row>
        </div>
      </template>
      <div v-if="hotKeywords.length" class="keywords-list">
        <div v-for="(keyword, index) in hotKeywords" :key="index" class="keyword-item">
          <span class="keyword-rank">{{ index + 1 }}</span>
          <span class="keyword-text">{{ keyword.keyword }}</span>
          <el-progress
              :percentage="getKeywordPercent(keyword.cnt)"
              :show-text="false"
              :stroke-width="4"
              class="keyword-progress"
          />
          <span class="keyword-count">{{ keyword.cnt }}</span>
        </div>
      </div>
      <el-empty v-else description="暂无搜索数据"/>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from 'vue'
import {getSearchStats} from '@/utils/api'

const loading = ref(false)
const searchData = reactive({
  totalKeywordsCount: 0,
  totalSearches: 0,
  avgPerDay: 0
})

const hotKeywords = ref<any[]>([])
const recentSearches = ref<any[]>([])

const getKeywordPercent = (count: number) => {
  if (!hotKeywords.value.length) {
    return 0
  }
  const max = hotKeywords.value[0].cnt
  return Math.round((count / max) * 100)
}

const loadSearchStats = async () => {
  loading.value = true
  try {
    const res = await getSearchStats({limit: 20, days: 7})
    const data = res.data
    hotKeywords.value = data.hotKeywords || []
    recentSearches.value = data.recentSearches || []
    searchData.totalSearches = data.totalSearches || 0
    searchData.totalKeywordsCount = data.totalKeywordsCount || 0
    searchData.avgPerDay = data.avgPerDay || 0
  } catch (e: any) {
    console.error('加载搜索统计失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSearchStats()
})
</script>

<style scoped>
.search-stats {
  padding: 24px;
}

.stats-card {
  height: 100%;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
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
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.keyword-rank {
  width: 22px;
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.keyword-text {
  flex: 1;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.keyword-progress {
  width: 80px;
}

.keyword-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  width: 36px;
  text-align: right;
}

.overview-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
