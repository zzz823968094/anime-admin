<template>
  <div class="progress-monitor">

    <!-- 任务启动区域 -->
    <div class="card mb-4">
      <div class="sec-title">启动爬取任务</div>
      <div class="form-row">
        <div class="form-group">
          <label>任务类型:</label>
          <select v-model="newTask.type" class="form-control">
            <option value="67">日本动漫</option>
            <option value="68">欧美动漫</option>
            <option value="66">中国动漫</option>
          </select>
        </div>
        <div class="form-group">
          <label>时间范围(小时):</label>
          <input type="number" v-model="newTask.hour" min="1" max="72" class="form-control" />
        </div>
        <button @click="startCrawlTask" class="btn btn-primary" :disabled="loading">
          {{ loading ? '启动中...' : '启动任务' }}
        </button>
      </div>
    </div>

    <!-- 当前运行任务 -->
    <div class="card mb-4" v-if="runningTask">
      <div class="sec-title">当前运行任务</div>
      <div class="progress-info">
        <h4>{{ runningTask.taskName }}</h4>
        <div class="progress-bar-container">
          <div 
            class="progress-bar" 
            :style="{ width: runningTask.progressPercent + '%' }"
          ></div>
          <span class="progress-text">{{ runningTask.progressPercent }}%</span>
        </div>
        <div class="task-details">
          <div class="detail-item">
            <span class="label">状态:</span>
            <span class="value status-running">{{ getStatusText(runningTask.status) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">页码进度:</span>
            <span class="value">{{ runningTask.processedPages }}/{{ runningTask.totalPages }}</span>
          </div>
          <div class="detail-item">
            <span class="label">数据量:</span>
            <span class="value">{{ runningTask.processedItems }} 条</span>
          </div>
          <div class="detail-item">
            <span class="label">成功/失败:</span>
            <span class="value">{{ runningTask.successCount }}/{{ runningTask.failCount }}</span>
          </div>
          <div class="detail-item">
            <span class="label">开始时间:</span>
            <span class="value">{{ formatTime(runningTask.startTime) }}</span>
          </div>
          <div class="detail-item" v-if="runningTask.updateTime">
            <span class="label">更新时间:</span>
            <span class="value">{{ formatTime(runningTask.updateTime) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近任务列表 -->
    <div class="card">
      <div class="sec-title">最近任务列表</div>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>类型</th>
              <th>进度</th>
              <th>状态</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in recentTasks" :key="task.taskKey">
              <td>{{ task.taskName }}</td>
              <td>{{ getTypeName(task.taskType) }}</td>
              <td>
                <div class="mini-progress">
                  <div 
                    class="mini-progress-bar" 
                    :style="{ width: task.progressPercent + '%' }"
                  ></div>
                  <span>{{ task.progressPercent }}%</span>
                </div>
              </td>
              <td>
                <span :class="['status-badge', getStatusClass(task.status)]">
                  {{ getStatusText(task.status) }}
                </span>
              </td>
              <td>{{ formatTime(task.updateTime) }}</td>
              <td>
                <button @click="viewTaskDetail(task.taskKey)" class="btn btn-sm btn-outline">
                  查看详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMoreTasks">
        <button @click="loadMoreTasks" class="btn btn-secondary" :disabled="loadingMore">
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </div>

    <!-- 任务详情模态框 -->
    <div v-if="selectedTask" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedTask.taskName }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="task-detail-grid">
            <div class="detail-card">
              <h4>基本信息</h4>
              <p><strong>任务ID:</strong> {{ selectedTask.taskKey }}</p>
              <p><strong>任务类型:</strong> {{ getTypeName(selectedTask.taskType) }}</p>
              <p><strong>状态:</strong> 
                <span :class="['status-badge', getStatusClass(selectedTask.status)]">
                  {{ getStatusText(selectedTask.status) }}
                </span>
              </p>
            </div>
            
            <div class="detail-card">
              <h4>进度信息</h4>
              <p><strong>总页数:</strong> {{ selectedTask.totalPages }}</p>
              <p><strong>已处理页数:</strong> {{ selectedTask.processedPages }}</p>
              <p><strong>完成百分比:</strong> {{ selectedTask.progressPercent }}%</p>
            </div>
            
            <div class="detail-card">
              <h4>数据统计</h4>
              <p><strong>总数据量:</strong> {{ selectedTask.totalItems }}</p>
              <p><strong>已处理数据:</strong> {{ selectedTask.processedItems }}</p>
              <p><strong>成功数量:</strong> {{ selectedTask.successCount }}</p>
              <p><strong>失败数量:</strong> {{ selectedTask.failCount }}</p>
            </div>
            
            <div class="detail-card">
              <h4>时间信息</h4>
              <p><strong>开始时间:</strong> {{ formatTime(selectedTask.startTime) }}</p>
              <p v-if="selectedTask.endTime"><strong>结束时间:</strong> {{ formatTime(selectedTask.endTime) }}</p>
              <p v-if="selectedTask.updateTime"><strong>更新时间:</strong> {{ formatTime(selectedTask.updateTime) }}</p>
            </div>
          </div>
          
          <!-- 实时进度条 -->
          <div class="realtime-progress" v-if="selectedTask.status === 'RUNNING'">
            <h4>实时进度</h4>
            <div class="progress-bar-container large">
              <div 
                class="progress-bar" 
                :style="{ width: selectedTask.progressPercent + '%' }"
              ></div>
              <span class="progress-text">{{ selectedTask.progressPercent }}%</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">关闭</button>
          <button @click="refreshTaskDetail" class="btn btn-primary" v-if="selectedTask.status === 'RUNNING'">
            刷新进度
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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
const runningTask = ref(null)
const recentTasks = ref([])
const selectedTask = ref(null)
const limit = ref(10)

// 新任务表单
const newTask = ref({
  type: '67',
  hour: 24
})

// 轮询定时器
let progressTimer = null

// 方法定义
const startCrawlTask = async () => {
  try {
    loading.value = true
    const response = await startTaskApi(newTask.value.type, newTask.value.hour)
    
    if (response.code === 200) {
      alert(`任务启动成功！\n任务ID: ${response.data.taskKey}\n${response.data.message}`)
      
      // 自动刷新运行中的任务和最近任务列表
      await refreshRunningTask()
      await loadRecentTasks()
    } else {
      alert('任务启动失败: ' + response.message)
    }
  } catch (error) {
    console.error('启动任务失败:', error)
    alert('启动任务失败: ' + (error.message || '未知错误'))
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
      const uniqueTasks = []
      const seenKeys = new Set()
      
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

const viewTaskDetail = async (taskKey) => {
  try {
    const response = await getTaskProgress(taskKey)
    if (response.code === 200) {
      selectedTask.value = response.data
      
      // 如果任务正在运行，开始轮询更新
      if (response.data.status === 'RUNNING') {
        startPolling(taskKey)
      }
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
    alert('获取任务详情失败: ' + (error.message || '未知错误'))
  }
}

const refreshTaskDetail = async () => {
  if (selectedTask.value) {
    await viewTaskDetail(selectedTask.value.taskKey)
  }
}

const closeModal = () => {
  selectedTask.value = null
  stopPolling()
}

const startPolling = (taskKey) => {
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
const getTypeName = (type) => {
  const types = {
    '66': '中国动漫',
    '67': '日本动漫', 
    '68': '欧美动漫'
  }
  return types[type] || `类型${type}`
}

const getStatusText = (status) => {
  const statuses = {
    'RUNNING': '运行中',
    'COMPLETED': '已完成',
    'FAILED': '失败',
    'PENDING': '等待中'
  }
  return statuses[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    'RUNNING': 'status-running',
    'COMPLETED': 'status-completed',
    'FAILED': 'status-failed',
    'PENDING': 'status-pending'
  }
  return classes[status] || ''
}

const formatTime = (timeStr) => {
  if (!timeStr) return '-'
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
.progress-monitor {
  padding: 0;
}

/* 表单区域 */
.form-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 12px;
  color: var(--sub);
}

.form-control {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 7px 12px;
  color: var(--text);
  font-size: 13px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: var(--accent);
}

/* 按钮样式 - 使用全局样式 */
.btn {
  border: none;
  padding: 7px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  font-weight: 500;
  transition: all 0.18s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent);           /* 纯色，禁止渐变 */
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.85;
}

.btn-secondary {
  background: var(--bg3);
  color: var(--sub);
  border: 1px solid var(--border);
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--text);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
}

.btn-outline:hover {
  background: rgba(124, 106, 247, 0.1);
  color: var(--accent2);
}

.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
}

.mb-4 {
  margin-bottom: 20px;
}

/* 进度条容器 */
.progress-info h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
}

.progress-bar-container {
  position: relative;
  height: 20px;
  background: var(--bg);
  border-radius: 8px;                  /* 8px 圆角 */
  overflow: hidden;
  margin: 10px 0;
  border: 1px solid var(--border);
}

.progress-bar-container.large {
  height: 30px;
}

.progress-bar {
  height: 100%;
  background: var(--accent);           /* 纯色，禁止渐变 */
  border-radius: 8px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text);
  font-weight: bold;
  font-size: 12px;
}

/* 任务详情 */
.task-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg3);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.detail-item .label {
  font-weight: 500;
  color: var(--sub);
  font-size: 13px;
}

.detail-item .value {
  color: var(--text);
  font-size: 13px;
}

/* 状态颜色 */
.status-running {
  color: #60a5fa;
}

.status-completed {
  color: #4ade80;
}

.status-failed {
  color: #f87171;
}

.status-pending {
  color: var(--gold);
}

/* 表格样式 - 使用全局样式 */
.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  font-size: 13px;
}

.table th,
.table td {
  padding: 11px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.table th {
  background: transparent;
  font-weight: 500;
  color: var(--sub);
  border-bottom: 1px solid var(--border);
}

.table td {
  color: #ccc;
}

.table tr:last-child td {
  border-bottom: none;
}

.table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

/* 迷你进度条 */
.mini-progress {
  position: relative;
  height: 16px;
  background: var(--bg);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.mini-progress-bar {
  height: 100%;
  background: var(--accent);           /* 纯色，禁止渐变 */
  border-radius: 8px;
  transition: width 0.3s ease;
}

.mini-progress span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  color: var(--text);
}

/* 状态徽章 */
.status-badge {
  padding: 2px 9px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.status-running {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
}

.status-badge.status-completed {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
}

.status-badge.status-failed {
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
}

.status-badge.status-pending {
  background: rgba(240, 180, 41, 0.12);
  color: var(--gold);
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
  color: var(--text);
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--sub);
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text);
}

.modal-body {
  padding: 20px;
}

.task-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.detail-card {
  background: var(--bg3);
  padding: 16px;
  border-radius: 10px;
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
}

.detail-card h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
}

.detail-card p {
  margin: 8px 0;
  color: var(--sub);
  font-size: 13px;
}

.detail-card p strong {
  color: var(--text);
  font-weight: 500;
}

.realtime-progress h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid var(--border);
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .task-details {
    grid-template-columns: 1fr;
  }
  
  .task-detail-grid {
    grid-template-columns: 1fr;
  }
  
  .table {
    font-size: 12px;
  }
  
  .table th,
  .table td {
    padding: 8px;
  }
}
</style>