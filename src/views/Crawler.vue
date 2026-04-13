<template>
  <div>
    <div class="page-hd">
      <div class="page-title">爬虫控制</div>
    </div>

    <!-- 增量 / 全量爬取 -->
    <div class="card">
      <div class="sec-title">增量 / 全量爬取</div>
      <div class="crawler-grid">
        <button class="crawler-btn" @click="crawl('crawl-now')">
          <div class="cb-icon">⚡</div>
          <div class="cb-title">全部增量爬取</div>
          <div class="cb-desc">所有分类最新更新</div>
        </button>
        <button class="crawler-btn" @click="crawlIncremental(25)">
          <div class="cb-icon">🇯🇵</div>
          <div class="cb-title">日本动漫增量</div>
          <div class="cb-desc">有变化才更新，自动停止</div>
        </button>
        <button class="crawler-btn" @click="crawlIncremental(26)">
          <div class="cb-icon">🌎</div>
          <div class="cb-title">欧美动漫增量</div>
          <div class="cb-desc">有变化才更新，自动停止</div>
        </button>
      </div>
      <div class="crawler-grid">
        <button class="crawler-btn" @click="crawlIncremental(24)">
          <div class="cb-icon">🇨🇳</div>
          <div class="cb-title">中国动漫增量</div>
          <div class="cb-desc">有变化才更新，自动停止</div>
        </button>
        <button class="crawler-btn" @click="crawl('full-sync')">
          <div class="cb-icon">🔄</div>
          <div class="cb-title">全量爬取（全部）</div>
          <div class="cb-desc">全分类，需数小时</div>
        </button>
        <button class="crawler-btn" @click="crawl('fill-covers')">
          <div class="cb-icon">🖼️</div>
          <div class="cb-title">补全封面/简介</div>
          <div class="cb-desc">调用 Bangumi API</div>
        </button>
      </div>
    </div>

    <!-- 失败重试 -->
    <div class="card">
      <div class="sec-title">失败记录重试</div>
      <div class="retry-row">
        <div class="retry-item">
          <span class="retry-label">🇯🇵 日本动漫</span>
          <span :class="['retry-count', failedCounts[25] > 0 ? 'has-data' : '']">{{ failedCounts[25] }}</span>
          <button class="btn btn-warning btn-sm" @click="handleRetry(25)">重试</button>
        </div>
        <div class="retry-item">
          <span class="retry-label">🌎 欧美动漫</span>
          <span :class="['retry-count', failedCounts[26] > 0 ? 'has-data' : '']">{{ failedCounts[26] }}</span>
          <button class="btn btn-warning btn-sm" @click="handleRetry(26)">重试</button>
        </div>
        <div class="retry-item">
          <span class="retry-label">🇨🇳 中国动漫</span>
          <span :class="['retry-count', failedCounts[24] > 0 ? 'has-data' : '']">{{ failedCounts[24] }}</span>
          <button class="btn btn-warning btn-sm" @click="handleRetry(24)">重试</button>
        </div>
      </div>
      <div :class="['crawl-log', crawlLogType]">{{ crawlLog }}</div>
    </div>

    <!-- 数据库统计 -->
    <div class="card">
      <div class="sec-title">数据库统计</div>
      <table class="tbl">
        <thead>
          <tr>
            <th>表</th>
            <th>数量</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="dbStats.length === 0">
            <td colspan="3" style="text-align:center;padding:20px;color:var(--sub)">加载中…</td>
          </tr>
          <tr v-for="stat in dbStats" :key="stat.table">
            <td>{{ stat.table }}</td>
            <td>{{ stat.count }}</td>
            <td style="color:var(--sub)">{{ stat.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { crawlApi, getFailedCounts, retryFailed, getDbStats } from '@/utils/api'

const failedCounts = reactive({
  25: 0,
  26: 0,
  24: 0
})

const crawlLog = ref('点击上方按钮触发爬取任务')
const crawlLogType = ref('')

const dbStats = ref([])

const setLog = (msg, type = '') => {
  crawlLog.value = msg
  crawlLogType.value = type
}

const crawl = async (action) => {
  try {
    setLog('正在启动爬取任务...', 'loading')
    await crawlApi(action)
    setLog('爬取任务已启动成功', 'ok')
    loadFailedCounts()
  } catch (e) {
    setLog('爬取任务启动失败: ' + (e.message || '未知错误'), 'err')
  }
}

const crawlIncremental = async (type) => {
  try {
    setLog(`正在启动${type === 25 ? '日本' : type === 26 ? '欧美' : '中国'}动漫增量爬取...`, 'loading')
    await crawlApi(`incremental-${type}`)
    setLog('增量爬取任务已启动', 'ok')
    loadFailedCounts()
  } catch (e) {
    setLog('增量爬取任务启动失败: ' + (e.message || '未知错误'), 'err')
  }
}

const handleRetry = async (type) => {
  try {
    setLog(`正在重试${type === 25 ? '日本' : type === 26 ? '欧美' : '中国'}动漫失败记录...`, 'loading')
    await retryFailed(type)
    setLog('重试任务已启动', 'ok')
    loadFailedCounts()
  } catch (e) {
    setLog('重试任务启动失败: ' + (e.message || '未知错误'), 'err')
  }
}

const loadFailedCounts = async () => {
  try {
    const res = await getFailedCounts()
    const data = res.data || {}
    failedCounts[25] = data[25] || 0
    failedCounts[26] = data[26] || 0
    failedCounts[24] = data[24] || 0
  } catch (e) {
    console.error('加载失败计数失败', e)
  }
}

const loadDbStats = async () => {
  try {
    const res = await getDbStats()
    dbStats.value = res.data || []
  } catch (e) {
    console.error('加载数据库统计失败', e)
  }
}

onMounted(() => {
  loadFailedCounts()
  loadDbStats()
})
</script>
