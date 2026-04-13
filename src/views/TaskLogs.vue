<template>
  <div>
    <div class="page-hd">
      <div class="page-title">任务执行记录</div>
    </div>

    <!-- 筛选栏 -->
    <div class="card">
      <div class="filter-bar">
        <div class="filter-item">
          <label>任务ID:</label>
          <input v-model.number="filterTaskId" type="number" placeholder="输入任务ID筛选" class="ctrl" />
        </div>
        <div class="filter-actions">
          <button class="btn btn-primary" @click="loadLogs">
            <span class="btn-icon">🔍</span>查询
          </button>
          <button class="btn btn-secondary" @click="resetFilter">
            <span class="btn-icon">🔄</span>重置
          </button>
        </div>
      </div>
    </div>

    <!-- 记录列表 -->
    <div class="card">
      <div v-if="loading" class="loading-state">加载中...</div>

      <div v-else-if="logs.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-text">暂无执行记录</div>
        <div class="empty-desc">任务执行后会在这里显示记录</div>
      </div>

      <table v-else class="tbl">
        <thead>
          <tr>
            <th>记录ID</th>
            <th>任务ID</th>
            <th>任务名称</th>
            <th>任务类型</th>
            <th>开始时间</th>
            <th>结束时间</th>
            <th>执行时长</th>
            <th>状态</th>
            <th>爬取页数</th>
            <th>信息</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ log.id }}</td>
            <td>{{ log.taskId }}</td>
            <td><strong>{{ log.taskName }}</strong></td>
            <td>
              <span :class="['type-badge', `type-${log.taskType}`]">
                {{ getTypeName(log.taskType) }}
              </span>
            </td>
            <td>{{ formatDateTime(log.startTime) }}</td>
            <td>{{ log.endTime ? formatDateTime(log.endTime) : '-' }}</td>
            <td>{{ log.duration ? formatDuration(log.duration) : '-' }}</td>
            <td>
              <span :class="['status-badge', `status-${log.status?.toLowerCase()}`]">
                {{ getStatusName(log.status) }}
              </span>
            </td>
            <td>{{ log.pagesCrawled || 0 }}</td>
            <td class="message-cell" :title="log.message">
              {{ log.message || '-' }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div v-if="logs.length > 0" class="pager">
        <button
          class="btn btn-secondary"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          上一页
        </button>
        <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页，共 {{ total }} 条</span>
        <button
          class="btn btn-secondary"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getTaskLogs } from '@/utils/api'

const logs = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const filterTaskId = ref(null)

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 获取类型名称
const getTypeName = (type) => {
  const types = { 25: '日本动漫', 26: '欧美动漫', 24: '中国动漫' }
  return types[type] || '未知'
}

// 获取状态名称
const getStatusName = (status) => {
  if (!status) return '未知'
  const statusMap = {
    RUNNING: '执行中',
    SUCCESS: '执行成功',
    FAILED: '执行失败',
    CANCELLED: '已取消'
  }
  return statusMap[status] || status
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 格式化执行时长
const formatDuration = (duration) => {
  if (!duration) return '-'
  const seconds = (duration / 1000).toFixed(2)
  const minutes = Math.floor(duration / 60000)
  const secs = Math.floor((duration % 60000) / 1000)
  
  if (minutes > 0) {
    return `${minutes}分${secs}秒`
  }
  return `${seconds}秒`
}

// 加载执行记录
const loadLogs = async () => {
  try {
    loading.value = true
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    if (filterTaskId.value) {
      params.taskId = filterTaskId.value
    }
    
    const res = await getTaskLogs(params)
    logs.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('加载执行记录失败:', error)
  } finally {
    loading.value = false
  }
}

// 重置筛选
const resetFilter = () => {
  filterTaskId.value = null
  currentPage.value = 1
  loadLogs()
}

// 跳转到指定页
const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadLogs()
}

// 页面加载时获取记录
onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-item label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.type-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.type-25 {
  background: #fed7e2;
  color: #97266d;
}

.type-26 {
  background: #feebc8;
  color: #c05621;
}

.type-24 {
  background: #c3dafe;
  color: #3730a3;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.status-running {
  background: #bee3f8;
  color: #2a4365;
}

.status-success {
  background: #c6f6d5;
  color: #22543d;
}

.status-failed {
  background: #fed7d7;
  color: #742a2a;
}

.status-cancelled {
  background: #e2e8f0;
  color: #2d3748;
}

.message-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--sub);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--sub);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.3;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text);
}

.empty-desc {
  font-size: 14px;
}

.pager {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.page-info {
  font-size: 14px;
  color: var(--sub);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-actions {
    width: 100%;
  }

  table {
    font-size: 12px;
  }
}
</style>
