<template>
  <div>
    <div class="page-hd">
      <div class="page-title">爬虫控制</div>
    </div>
    <!-- 执行日志 -->
    <div class="card">
      <div class="sec-title">执行日志</div>
      <div :class="['crawl-log', crawlLogType]">{{ crawlLog }}</div>
    </div>
    <!-- 快速同步（全量） -->
    <div class="card">
      <div class="sec-title">全量爬取(适合初次导入数据)</div>
      <div class="crawler-grid">
        <button class="crawler-btn" @click="handleCrawlerAllSync(67)">
          <div class="cb-icon">Japan</div>
          <div class="cb-title">日韩动漫</div>
        </button>
        <button class="crawler-btn" @click="handleCrawlerAllSync(68)">
          <div class="cb-icon">US</div>
          <div class="cb-title">欧美动漫</div>
        </button>
        <button class="crawler-btn" @click="handleCrawlerAllSync(66)">
          <div class="cb-icon">China</div>
          <div class="cb-title">中文动漫</div>
        </button>
      </div>
    </div>
    <div class="card">
      <div class="sec-title">失败数量,点击重启</div>
      <div class="crawler-grid">
        <button class="crawler-btn" @click="restartFail(67)">
          <div class="cb-icon">{{ japanTotal }}</div>
          <div class="cb-title">🇯🇵日韩动漫</div>
        </button>
        <button class="crawler-btn" @click="restartFail(68)">
          <div class="cb-icon">{{ usaTotal }}</div>
          <div class="cb-title">🌎欧美动漫</div>
        </button>
        <button class="crawler-btn" @click="restartFail(66)">
          <div class="cb-icon">{{ chinaTotal }}</div>
          <div class="cb-title">🇨🇳中文动漫</div>
        </button>
      </div>
    </div>
    <!-- 按小时更新 -->
    <div class="card">
      <div class="sec-title">按小时更新（指定分类+时间范围）</div>
      <div class="crawler-grid">
        <button class="crawler-btn" @click="crawlByHour(67, 3)">
          <div class="cb-icon">🇯🇵</div>
          <div class="cb-title">日韩动漫</div>
          <div class="cb-desc">最近3小时</div>
        </button>
        <button class="crawler-btn" @click="crawlByHour(68, 3)">
          <div class="cb-icon">🌎</div>
          <div class="cb-title">欧美动漫</div>
          <div class="cb-desc">最近3小时</div>
        </button>
        <button class="crawler-btn" @click="crawlByHour(66, 3)">
          <div class="cb-icon">🇨🇳</div>
          <div class="cb-title">中文动漫</div>
          <div class="cb-desc">最近3小时</div>
        </button>
      </div>
      <div class="crawler-grid">
        <button class="crawler-btn" @click="crawlByHour(67, 6)">
          <div class="cb-icon">🇯🇵</div>
          <div class="cb-title">日韩动漫</div>
          <div class="cb-desc">最近6小时</div>
        </button>
        <button class="crawler-btn" @click="crawlByHour(68, 6)">
          <div class="cb-icon">🌎</div>
          <div class="cb-title">欧美动漫</div>
          <div class="cb-desc">最近6小时</div>
        </button>
        <button class="crawler-btn" @click="crawlByHour(66, 6)">
          <div class="cb-icon">🇨🇳</div>
          <div class="cb-title">中文动漫</div>
          <div class="cb-desc">最近6小时</div>
        </button>
      </div>
      <div class="crawler-grid">
        <button class="crawler-btn" @click="crawlByHour(67, 12)">
          <div class="cb-icon">🇯🇵</div>
          <div class="cb-title">日韩动漫</div>
          <div class="cb-desc">最近12小时</div>
        </button>
        <button class="crawler-btn" @click="crawlByHour(68, 12)">
          <div class="cb-icon">🌎</div>
          <div class="cb-title">欧美动漫</div>
          <div class="cb-desc">最近12小时</div>
        </button>
        <button class="crawler-btn" @click="crawlByHour(66, 12)">
          <div class="cb-icon">🇨🇳</div>
          <div class="cb-title">中文动漫</div>
          <div class="cb-desc">最近12小时</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {crawlNow, crawlerAllSync} from '@/utils/api'
import {getFailRecords, restartCrawler} from '@/api/crawler'

const crawlLog = ref('点击上方按钮触发爬取任务')
const crawlLogType = ref('')
const chinaTotal = ref(0)
const japanTotal = ref(0)
const usaTotal = ref(0)

const setLog = (msg, type = '') => {
  crawlLog.value = msg
  crawlLogType.value = type
}
const getFailList = async () => {
  try {
    const res = await getFailRecords()
    if (res.code === 200) {
      chinaTotal.value = res.data.china;
      japanTotal.value = res.data.japan;
      usaTotal.value = res.data.usa;
    }
  } catch (e) {
    setLog('获取失败记录失败: ' + (e.message || '未知错误'), 'err')
  }
}

const restartFail = async (type) => {
  setLog(`正在启动${type}动漫失败ID重新获取...`, 'loading')
  try {
    const res = await restartCrawler(type)
    if (res.code === 200) {
      await getFailList();
      setLog(`${type}动漫失败ID重新获取,获取成功`, 'ok')
    } else {
      setLog('重新获取数据失败: ' + res.message, 'err')
    }
  } catch (e) {
    setLog('重新获取数据失败: ' + (e.message || '未知错误'), 'err')
  }
}
const crawlByHour = async (type, hour) => {
  try {
    const typeName = type === 67 ? '日韩' : type === 68 ? '欧美' : '中文'
    setLog(`正在启动${typeName}动漫最近${hour}小时更新...`, 'loading')
    await crawlNow({type, hour})
    setLog(`${typeName}动漫最近${hour}小时更新任务已启动`, 'ok')
  } catch (e) {
    setLog('按小时更新任务启动失败: ' + (e.message || '未知错误'), 'err')
  }
}

const handleCrawlerAllSync = async (type) => {
  try {
    const typeName = type === 67 ? '日韩' : type === 68 ? '欧美' : '中文'
    setLog(`正在启动${typeName}动漫全量入库...`, 'loading')
    await crawlerAllSync(type)
    setLog(`${typeName}动漫全量入库任务已启动`, 'ok')
  } catch (e) {
    setLog('全量入库任务启动失败: ' + (e.message || '未知错误'), 'err')
  }
}

onMounted(() => {
  getFailList();
  setLog('准备就绪，请选择爬取任务')
})
</script>
