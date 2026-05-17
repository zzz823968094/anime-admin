<template>
  <div class="crawler">
    <!-- 执行日志 -->
    <el-card shadow="never" class="log-card">
      <template #header>
        <div class="card-header">执行日志</div>
      </template>
      <div :class="['crawl-log', crawlLogType]">{{ crawlLog }}</div>
    </el-card>

    <!-- 快速同步（全量） -->
    <el-card shadow="never" class="action-card">
      <template #header>
        <div class="card-header">全量爬取（适合初次导入数据）</div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-button class="crawler-btn" @click="handleCrawlerAllSync(67)">
            <div class="cb-icon">Japan</div>
            <div class="cb-title">日韩动漫</div>
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button class="crawler-btn" @click="handleCrawlerAllSync(68)">
            <div class="cb-icon">US</div>
            <div class="cb-title">欧美动漫</div>
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button class="crawler-btn" @click="handleCrawlerAllSync(66)">
            <div class="cb-icon">China</div>
            <div class="cb-title">中文动漫</div>
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 按小时更新 -->
    <el-card shadow="never" class="action-card">
      <template #header>
        <div class="card-header">按小时更新（指定分类+时间范围）</div>
      </template>
      <el-row :gutter="20" class="hour-row">
        <el-col :span="8">
          <el-button class="crawler-btn" @click="crawlByHour(67, 3)">
            <div class="cb-icon">🇯🇵</div>
            <div class="cb-title">日韩动漫</div>
            <div class="cb-desc">最近3小时</div>
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button class="crawler-btn" @click="crawlByHour(68, 3)">
            <div class="cb-icon">🌎</div>
            <div class="cb-title">欧美动漫</div>
            <div class="cb-desc">最近3小时</div>
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button class="crawler-btn" @click="crawlByHour(66, 3)">
            <div class="cb-icon">🇨🇳</div>
            <div class="cb-title">中文动漫</div>
            <div class="cb-desc">最近3小时</div>
          </el-button>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="hour-row">
        <el-col :span="8">
          <el-button class="crawler-btn" @click="crawlByHour(67, 6)">
            <div class="cb-icon">🇯🇵</div>
            <div class="cb-title">日韩动漫</div>
            <div class="cb-desc">最近6小时</div>
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button class="crawler-btn" @click="crawlByHour(68, 6)">
            <div class="cb-icon">🌎</div>
            <div class="cb-title">欧美动漫</div>
            <div class="cb-desc">最近6小时</div>
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button class="crawler-btn" @click="crawlByHour(66, 6)">
            <div class="cb-icon">🇨🇳</div>
            <div class="cb-title">中文动漫</div>
            <div class="cb-desc">最近6小时</div>
          </el-button>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="hour-row">
        <el-col :span="8">
          <el-button class="crawler-btn" @click="crawlByHour(67, 12)">
            <div class="cb-icon">🇯🇵</div>
            <div class="cb-title">日韩动漫</div>
            <div class="cb-desc">最近12小时</div>
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button class="crawler-btn" @click="crawlByHour(68, 12)">
            <div class="cb-icon">🌎</div>
            <div class="cb-title">欧美动漫</div>
            <div class="cb-desc">最近12小时</div>
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button class="crawler-btn" @click="crawlByHour(66, 12)">
            <div class="cb-icon">🇨🇳</div>
            <div class="cb-title">中文动漫</div>
            <div class="cb-desc">最近12小时</div>
          </el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { crawlNow, crawlerAllSync } from '@/utils/api'

  const crawlLog = ref('点击上方按钮触发爬取任务')
  const crawlLogType = ref('')

  const setLog = (msg: string, type = '') => {
    crawlLog.value = msg
    crawlLogType.value = type
  }

  const crawlByHour = async (type: number, hour: number) => {
    try {
      const typeName = type === 67 ? '日韩' : type === 68 ? '欧美' : '中文'
      setLog(`正在启动${typeName}动漫最近${hour}小时更新...`, 'loading')
      await crawlNow({ type, hour })
      setLog(`${typeName}动漫最近${hour}小时更新任务已启动`, 'ok')
    } catch (e: any) {
      setLog('按小时更新任务启动失败: ' + (e.message || '未知错误'), 'err')
    }
  }

  const handleCrawlerAllSync = async (type: number) => {
    try {
      const typeName = type === 67 ? '日韩' : type === 68 ? '欧美' : '中文'
      setLog(`正在启动${typeName}动漫全量入库...`, 'loading')
      await crawlerAllSync(type)
      setLog(`${typeName}动漫全量入库任务已启动`, 'ok')
    } catch (e: any) {
      setLog('全量入库任务启动失败: ' + (e.message || '未知错误'), 'err')
    }
  }

  onMounted(() => {
    setLog('准备就绪，请选择爬取任务')
  })
</script>

<style scoped>
  .crawler {
    padding: 24px;
  }

  .log-card,
  .action-card {
    margin-bottom: 20px;
  }

  .card-header {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .hour-row {
    margin-bottom: 15px;
  }

  .hour-row:last-child {
    margin-bottom: 0;
  }

  .crawler-btn {
    width: 100%;
    height: auto;
    padding: 15px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
  }

  .crawler-btn:hover {
    background: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .cb-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .cb-title {
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
  }

  .cb-desc {
    font-size: 12px;
    color: #666;
  }

  .crawl-log {
    padding: 15px;
    border-radius: 4px;
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 200px;
    overflow-y: auto;
  }

  .crawl-log.loading {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
  }

  .crawl-log.ok {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .crawl-log.err {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
</style>
