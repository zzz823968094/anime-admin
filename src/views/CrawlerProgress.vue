<template>
  <div class="crawler-progress">
    <!-- 任务启动区域 -->
    <el-card shadow="never" class="mb-4">
      <template #header>
        <div class="card-header">启动爬取任务</div>
      </template>
      <el-form :inline="true" class="form-row">
        <el-form-item label="任务类型">
          <el-select v-model="newTask.type" style="width: 150px">
            <el-option label="日本动漫" value="67" />
            <el-option label="欧美动漫" value="68" />
            <el-option label="中国动漫" value="66" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围(小时)">
          <el-input-number v-model="newTask.hour" :min="1" :max="72" style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="startCrawlTask">
            {{ loading ? '启动中...' : '启动任务' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 当前运行任务 -->
    <el-card v-if="runningTask" shadow="never" class="mb-4">
      <template #header>
        <div class="card-header">当前运行任务</div>
      </template>
      <div class="progress-info">
        <h4>{{ runningTask.taskName }}</h4>
        <el-progress :percentage="runningTask.progressPercent" :stroke-width="20" />
        <el-descriptions :column="2" border class="mt-3">
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(runningTask.status)">
              {{ getStatusText(runningTask.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="页码进度">
            {{ runningTask.processedPages }}/{{ runningTask.totalPages }}
          </el-descriptions-item>
          <el-descriptions-item label="数据量">
            {{ runningTask.processedItems }} 条
          </el-descriptions-item>
          <el-descriptions-item label="成功/失败">
            {{ runningTask.successCount }}/{{ runningTask.failCount }}
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{ formatTime(runningTask.startTime) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="runningTask.updateTime" label="更新时间">
            {{ formatTime(runningTask.updateTime) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- 最近任务列表 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">最近任务列表</div>
      </template>
      <el-table :data="recentTasks" border stripe>
        <el-table-column prop="taskName" label="任务名称" min-width="200" />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            {{ getTypeName(row.taskType) }}
          </template>
        </el-table-column>
        <el-table-column label="进度" width="180">
          <template #default="{ row }">
            <el-progress :percentage="row.progressPercent" :stroke-width="10" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewTaskDetail(row.taskKey)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 加载更多 -->
      <div v-if="hasMoreTasks" class="load-more mt-3">
        <el-button :loading="loadingMore" @click="loadMoreTasks">
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </el-button>
      </div>
    </el-card>

    <!-- 任务详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="selectedTask?.taskName"
      width="800px"
      @close="closeModal"
    >
      <el-descriptions v-if="selectedTask" :column="2" border>
        <el-descriptions-item label="任务ID" :span="2">
          {{ selectedTask.taskKey }}
        </el-descriptions-item>
        <el-descriptions-item label="任务类型">
          {{ getTypeName(selectedTask.taskType) }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(selectedTask.status)">
            {{ getStatusText(selectedTask.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="总页数">
          {{ selectedTask.totalPages }}
        </el-descriptions-item>
        <el-descriptions-item label="已处理页数">
          {{ selectedTask.processedPages }}
        </el-descriptions-item>
        <el-descriptions-item label="完成百分比">
          {{ selectedTask.progressPercent }}%
        </el-descriptions-item>
        <el-descriptions-item label="总数据量">
          {{ selectedTask.totalItems }}
        </el-descriptions-item>
        <el-descriptions-item label="已处理数据">
          {{ selectedTask.processedItems }}
        </el-descriptions-item>
        <el-descriptions-item label="成功数量">
          {{ selectedTask.successCount }}
        </el-descriptions-item>
        <el-descriptions-item label="失败数量">
          {{ selectedTask.failCount }}
        </el-descriptions-item>
        <el-descriptions-item label="开始时间" :span="2">
          {{ formatTime(selectedTask.startTime) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="selectedTask.endTime" label="结束时间" :span="2">
          {{ formatTime(selectedTask.endTime) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="selectedTask.updateTime" label="更新时间" :span="2">
          {{ formatTime(selectedTask.updateTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 实时进度条 -->
      <div v-if="selectedTask?.status === 'RUNNING'" class="realtime-progress mt-3">
        <h4>实时进度</h4>
        <el-progress :percentage="selectedTask.progressPercent" :stroke-width="20" />
      </div>

      <template #footer>
        <el-button @click="closeModal">关闭</el-button>
        <el-button
          v-if="selectedTask?.status === 'RUNNING'"
          type="primary"
          @click="refreshTaskDetail"
        >
          刷新进度
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    getRunningTask,
    getRecentTasks,
    startCrawlTask as startTaskApi,
    getTaskProgress
  } from '@/api/crawlerProgress'

  // 响应式数据
  const loading = ref(false)
  const loadingMore = ref(false)
  const hasMoreTasks = ref(true)
  const runningTask = ref<any>(null)
  const recentTasks = ref<any[]>([])
  const selectedTask = ref<any>(null)
  const showDetailDialog = ref(false)
  const limit = ref(10)

  // 新任务表单
  const newTask = ref({
    type: '67',
    hour: 24
  })

  // 轮询定时器
  let progressTimer: any = null

  // 方法定义
  const startCrawlTask = async () => {
    try {
      loading.value = true
      const response = await startTaskApi(newTask.value.type, newTask.value.hour)

      if (response.code === 200) {
        ElMessage.success(
          `任务启动成功！\n任务ID: ${response.data.taskKey}\n${response.data.message}`
        )

        // 自动刷新运行中的任务和最近任务列表
        await refreshRunningTask()
        await loadRecentTasks()
      } else {
        ElMessage.error('任务启动失败: ' + response.message)
      }
    } catch (error: any) {
      console.error('启动任务失败:', error)
      ElMessage.error('启动任务失败: ' + (error.message || '未知错误'))
    } finally {
      loading.value = false
    }
  }

  const refreshRunningTask = async () => {
    try {
      const response = await getRunningTask()
      if (response.code === 200 && response.data) {
        runningTask.value = response.data

        // 如果任务仍在运行，设置轮询
        if (response.data.status === 'RUNNING') {
          startPolling(response.data.taskKey)
        } else {
          stopPolling()
        }
      } else {
        runningTask.value = null
        stopPolling()
      }
    } catch (error) {
      console.error('获取运行任务失败:', error)
    }
  }

  const loadRecentTasks = async (append = false) => {
    try {
      if (!append) {
        loadingMore.value = true
      }

      const response = await getRecentTasks(limit.value)
      if (response.code === 200) {
        // 基于taskKey去重
        const uniqueTasks: any[] = []
        const seenKeys = new Set<string>()

        const tasksToProcess = append ? [...recentTasks.value, ...response.data] : response.data

        for (const task of tasksToProcess) {
          if (!seenKeys.has(task.taskKey)) {
            seenKeys.add(task.taskKey)
            uniqueTasks.push(task)
          }
        }

        recentTasks.value = uniqueTasks

        // 判断是否还有更多数据
        hasMoreTasks.value = response.data.length >= limit.value
      }
    } catch (error) {
      console.error('加载最近任务失败:', error)
    } finally {
      loadingMore.value = false
    }
  }

  const loadMoreTasks = () => {
    limit.value += 10
    loadRecentTasks(true)
  }

  const viewTaskDetail = async (taskKey: string) => {
    try {
      const response = await getTaskProgress(taskKey)
      if (response.code === 200) {
        selectedTask.value = response.data
        showDetailDialog.value = true

        // 如果任务正在运行，开始轮询更新
        if (response.data.status === 'RUNNING') {
          startPolling(taskKey)
        }
      }
    } catch (error: any) {
      console.error('获取任务详情失败:', error)
      ElMessage.error('获取任务详情失败: ' + (error.message || '未知错误'))
    }
  }

  const refreshTaskDetail = async () => {
    if (selectedTask.value) {
      await viewTaskDetail(selectedTask.value.taskKey)
    }
  }

  const closeModal = () => {
    showDetailDialog.value = false
    selectedTask.value = null
    stopPolling()
  }

  const startPolling = (taskKey: string) => {
    stopPolling() // 先停止之前的轮询

    progressTimer = setInterval(async () => {
      if (selectedTask.value && selectedTask.value.taskKey === taskKey) {
        await refreshTaskDetail()
      } else if (runningTask.value && runningTask.value.taskKey === taskKey) {
        await refreshRunningTask()
      }
    }, 2000) // 每2秒轮询一次
  }

  const stopPolling = () => {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }

  // 工具函数
  const getTypeName = (type: string) => {
    const types: Record<string, string> = {
      '66': '中国动漫',
      '67': '日本动漫',
      '68': '欧美动漫'
    }
    return types[type] || `类型${type}`
  }

  const getStatusText = (status: string) => {
    const statuses: Record<string, string> = {
      RUNNING: '运行中',
      COMPLETED: '已完成',
      FAILED: '失败',
      PENDING: '等待中'
    }
    return statuses[status] || status
  }

  const getStatusType = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
    const typeMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      RUNNING: 'warning',
      COMPLETED: 'success',
      FAILED: 'danger',
      PENDING: 'info'
    }
    return typeMap[status] || 'info'
  }

  const formatTime = (timeStr?: string) => {
    if (!timeStr) {
      return '-'
    }
    return new Date(timeStr).toLocaleString('zh-CN')
  }

  // 生命周期钩子
  onMounted(() => {
    refreshRunningTask()
    loadRecentTasks()
  })

  onUnmounted(() => {
    stopPolling()
  })
</script>

<style scoped>
  .crawler-progress {
    padding: 24px;
  }

  .mb-4 {
    margin-bottom: 20px;
  }

  .mt-3 {
    margin-top: 15px;
  }

  .card-header {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .form-row {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  .progress-info h4 {
    margin-bottom: 15px;
    font-size: 18px;
    color: var(--el-text-color-primary);
  }

  .load-more {
    display: flex;
    justify-content: center;
    margin-top: 15px;
  }

  .realtime-progress h4 {
    margin-bottom: 10px;
    font-size: 16px;
    color: var(--el-text-color-primary);
  }
</style>
