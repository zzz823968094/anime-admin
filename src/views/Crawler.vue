<template>
  <div>
    <div class="page-hd">
      <div class="page-title">爬虫控制</div>
    </div>
    <!-- 快速同步（全量） -->
    <div class="card">
      <div class="sec-title">全量爬取(适合初次导入数据)</div>
      <div class="crawler-grid">
        <button class="crawler-btn" @click="handleCrawlerAllSync(25)">
          <div class="cb-icon">🇯🇵</div>
          <div class="cb-title">日本动漫</div>
        </button>
        <button class="crawler-btn" @click="handleCrawlerAllSync(26)">
          <div class="cb-icon">🌎</div>
          <div class="cb-title">欧美动漫</div>
        </button>
        <button class="crawler-btn" @click="handleCrawlerAllSync(24)">
          <div class="cb-icon">🇨🇳</div>
          <div class="cb-title">中国动漫</div>
        </button>
      </div>
    </div>

    <!-- 按小时更新 -->
    <div class="card">
      <div class="sec-title">按小时更新（指定分类+时间范围）</div>
      <div class="crawler-grid">
        <button class="crawler-btn" @click="crawlByHour(25, 3)">
          <div class="cb-icon">🇯🇵</div>
          <div class="cb-title">日本动漫</div>
          <div class="cb-desc">最近3小时</div>
        </button>
        <button class="crawler-btn" @click="crawlByHour(26, 3)">
          <div class="cb-icon">🌎</div>
          <div class="cb-title">欧美动漫</div>
          <div class="cb-desc">最近3小时</div>
        </button>
        <button class="crawler-btn" @click="crawlByHour(24, 3)">
          <div class="cb-icon">🇨🇳</div>
          <div class="cb-title">中国动漫</div>
          <div class="cb-desc">最近3小时</div>
        </button>
      </div>
      <div class="crawler-grid">
        <button class="crawler-btn" @click="crawlByHour(25, 6)">
          <div class="cb-icon">🇯🇵</div>
          <div class="cb-title">日本动漫</div>
          <div class="cb-desc">最近6小时</div>
        </button>
        <button class="crawler-btn" @click="crawlByHour(26, 6)">
          <div class="cb-icon">🌎</div>
          <div class="cb-title">欧美动漫</div>
          <div class="cb-desc">最近6小时</div>
        </button>
        <button class="crawler-btn" @click="crawlByHour(24, 6)">
          <div class="cb-icon">🇨🇳</div>
          <div class="cb-title">中国动漫</div>
          <div class="cb-desc">最近6小时</div>
        </button>
      </div>
      <div class="crawler-grid">
        <button class="crawler-btn" @click="crawlByHour(25, 12)">
          <div class="cb-icon">🇯🇵</div>
          <div class="cb-title">日本动漫</div>
          <div class="cb-desc">最近12小时</div>
        </button>
        <button class="crawler-btn" @click="crawlByHour(26, 12)">
          <div class="cb-icon">🌎</div>
          <div class="cb-title">欧美动漫</div>
          <div class="cb-desc">最近12小时</div>
        </button>
        <button class="crawler-btn" @click="crawlByHour(24, 12)">
          <div class="cb-icon">🇨🇳</div>
          <div class="cb-title">中国动漫</div>
          <div class="cb-desc">最近12小时</div>
        </button>
      </div>
    </div>



    <!-- 执行日志 -->
    <div class="card">
      <div class="sec-title">执行日志</div>
      <div :class="['crawl-log', crawlLogType]">{{ crawlLog }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { crawlNow, crawlerAllSync } from '@/utils/api'

const crawlLog = ref('点击上方按钮触发爬取任务')
const crawlLogType = ref('')

const setLog = (msg, type = '') => {
  crawlLog.value = msg
  crawlLogType.value = type
}



const crawlByHour = async (type, hour) => {
  try {
    const typeName = type === 25 ? '日本' : type === 26 ? '欧美' : '中国'
    setLog(`正在启动${typeName}动漫最近${hour}小时更新...`, 'loading')
    await crawlNow({ type, hour })
    setLog(`${typeName}动漫最近${hour}小时更新任务已启动`, 'ok')
  } catch (e) {
    setLog('按小时更新任务启动失败: ' + (e.message || '未知错误'), 'err')
  }
}

const handleCrawlerAllSync = async (type) => {
  try {
    const typeName = type === 25 ? '日本' : type === 26 ? '欧美' : '中国'
    setLog(`正在启动${typeName}动漫全量入库...`, 'loading')
    await crawlerAllSync(type)
    setLog(`${typeName}动漫全量入库任务已启动`, 'ok')
  } catch (e) {
    setLog('全量入库任务启动失败: ' + (e.message || '未知错误'), 'err')
  }
}

onMounted(() => {
  setLog('准备就绪，请选择爬取任务')
})
</script>
