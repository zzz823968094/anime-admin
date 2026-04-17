<template>
  <div>
    <div class="page-hd">
      <div class="page-title">定时任务管理</div>
    </div>

    <!-- 工具栏 -->
    <div class="card">
      <div class="sec-title">快速操作</div>
      <div class="toolbar">
        <div class="toolbar-left">
          <button class="btn btn-primary" @click="openCreateModal">
            <span class="btn-icon">➕</span>创建任务
          </button>
          <button class="btn btn-ghost" @click="loadTasks">
            <span class="btn-icon">🔄</span>刷新
          </button>
          <button class="btn btn-ghost" @click="goToLogs">
            <span class="btn-icon">📋</span>执行记录
          </button>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-success" @click="quickSync(25, 44)">
            日本动漫(24H内数据同步)
          </button>
          <button class="btn btn-warning" @click="quickSync(26, 9)">
            欧美动漫(24H内数据同步)
          </button>
          <button class="btn btn-primary" @click="quickSync(24, 47)">
            中国动漫(24H内数据同步)
          </button>
        </div>
      </div>
    </div>

    <!-- 任务列表表格 -->
    <div class="card">
      <div v-if="loading" class="loading-state">加载中...</div>
      
      <div v-else-if="tasks.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-text">暂无定时任务</div>
        <div class="empty-desc">点击"创建任务"按钮添加新的定时任务</div>
      </div>

      <table v-else class="tbl">
        <thead>
          <tr>
            <th>ID</th>
            <th>任务名称</th>
            <th>任务类型</th>
            <th>Cron 表达式</th>
            <th>小时</th>
            <th>状态</th>
            <th>启用</th>
            <th>上次执行</th>
            <th>下次执行</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in tasks" :key="task.id">
            <td>{{ task.id }}</td>
            <td><strong>{{ task.taskName }}</strong></td>
            <td>
              <span :class="['type-badge', `type-${task.taskType}`]">
                {{ getTypeName(task.taskType) }}
              </span>
            </td>
            <td><code>{{ task.cronExpression }}</code></td>

            <td><code>{{ task.hour }}H内数据</code></td>
            <td>
              <span :class="['status-badge', `status-${task.status?.name?.toLowerCase()}`]">
                {{ getStatusName(task.status) }}
              </span>
            </td>
            <td>
              <span :class="['enabled-badge', `enabled-${task.enabled}`]">
                {{ task.enabled ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ task.lastExecuteTime ? formatDateTime(task.lastExecuteTime) : '-' }}</td>
            <td>{{ task.nextExecuteTime ? formatDateTime(task.nextExecuteTime) : '-' }}</td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="task.status?.name === 'RUNNING'"
                  class="btn btn-danger btn-xs"
                  @click="cancelTask(task.id)"
                >
                  取消
                </button>
                <button
                  v-else
                  class="btn btn-success btn-xs"
                  @click="executeTask(task.id)"
                >
                  执行
                </button>
                <button class="btn btn-primary btn-xs" @click="openEditModal(task.id)">
                  编辑
                </button>
                <button
                  :class="['btn btn-xs', task.enabled ? 'btn-warning' : 'btn-success']"
                  @click="toggleTask(task.id, !task.enabled)"
                >
                  {{ task.enabled ? '禁用' : '启用' }}
                </button>
                <button class="btn btn-danger btn-xs" @click="deleteTask(task.id)">
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 创建/编辑任务模态框 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ modalTitle }}</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <form @submit.prevent="saveTask">
          <div class="form-group">
            <label for="taskName">任务名称 *</label>
            <input
              id="taskName"
              v-model="formData.taskName"
              type="text"
              required
              placeholder="例如:中国动漫每日同步"
            />
          </div>
          <div class="form-group">
            <label for="taskType">任务类型 *</label>
            <select id="taskType" v-model="formData.taskType" required>
              <option :value="25">日本动漫</option>
              <option :value="26">欧美动漫</option>
              <option :value="24">中国动漫</option>
            </select>
          </div>
          <div class="form-group">
            <label for="cronExpression">Cron 表达式 *</label>
            <div class="cron-input-wrapper">
              <input
                id="cronExpression"
                v-model="formData.cronExpression"
                type="text"
                required
                placeholder="例如:0 0 2 * * ?"
              />
              <button type="button" class="btn btn-ghost btn-sm cron-generator-btn" @click="showCronGenerator = !showCronGenerator">
                🛠️ 生成器
              </button>
            </div>
            <small class="form-hint">
              示例:0 0 2 * * ? (每天凌晨2点) | 0 */6 * * * ? (每6小时)
            </small>

            <!-- Cron 表达式生成器 -->
            <div v-if="showCronGenerator" class="cron-generator">
              <div class="cron-generator-header">
                <h4>Cron 表达式生成器</h4>
                <button type="button" class="close-generator" @click="showCronGenerator = false">&times;</button>
              </div>

              <!-- 快捷模板 -->
              <div class="cron-section">
                <div class="cron-section-title">快捷模板</div>
                <div class="cron-presets">
                  <button type="button" class="preset-btn" @click="applyPreset('0 0 2 * * ?')">
                    <div class="preset-icon">🌙</div>
                    <div class="preset-text">每天凌晨2点</div>
                  </button>
                  <button type="button" class="preset-btn" @click="applyPreset('0 0 12 * * ?')">
                    <div class="preset-icon">☀️</div>
                    <div class="preset-text">每天中午12点</div>
                  </button>
                  <button type="button" class="preset-btn" @click="applyPreset('0 */6 * * * ?')">
                    <div class="preset-icon">⏰</div>
                    <div class="preset-text">每6小时</div>
                  </button>
                  <button type="button" class="preset-btn" @click="applyPreset('0 0 * * * ?')">
                    <div class="preset-icon">🕐</div>
                    <div class="preset-text">每小时</div>
                  </button>
                  <button type="button" class="preset-btn" @click="applyPreset('0 */30 * * * ?')">
                    <div class="preset-icon">⚡</div>
                    <div class="preset-text">每30分钟</div>
                  </button>
                  <button type="button" class="preset-btn" @click="applyPreset('0 0 9-18 * * ?')">
                    <div class="preset-icon">💼</div>
                    <div class="preset-text">工作时间(9-18点)</div>
                  </button>
                  <button type="button" class="preset-btn" @click="applyPreset('0 0 10 * * 1')">
                    <div class="preset-icon">📅</div>
                    <div class="preset-text">每周一10点</div>
                  </button>
                  <button type="button" class="preset-btn" @click="applyPreset('0 0 1 1 * ?')">
                    <div class="preset-icon">🎉</div>
                    <div class="preset-text">每月1号凌晨1点</div>
                  </button>
                </div>
              </div>

              <!-- 自定义生成 -->
              <div class="cron-section">
                <div class="cron-section-title">自定义配置</div>
                
                <!-- 执行周期 -->
                <div class="cron-field">
                  <label class="cron-label">执行周期</label>
                  <select v-model="cronConfig.frequency" @change="generateCron" class="ctrl cron-select">
                    <option value="minute">每分钟</option>
                    <option value="hourly">每小时</option>
                    <option value="daily">每天</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                  </select>
                </div>

                <!-- 小时选择 -->
                <div v-if="cronConfig.frequency === 'daily' || cronConfig.frequency === 'weekly' || cronConfig.frequency === 'monthly'" class="cron-field">
                  <label class="cron-label">执行小时</label>
                  <select v-model="cronConfig.hour" @change="generateCron" class="ctrl cron-select">
                    <option v-for="h in 24" :key="h" :value="h - 1">{{ h - 1 }}点</option>
                  </select>
                </div>

                <!-- 分钟选择 -->
                <div v-if="cronConfig.frequency !== 'minute'" class="cron-field">
                  <label class="cron-label">执行分钟</label>
                  <select v-model="cronConfig.minute" @change="generateCron" class="ctrl cron-select">
                    <option v-for="m in 60" :key="m" :value="m - 1">{{ m - 1 }}分</option>
                  </select>
                </div>

                <!-- 周几选择 -->
                <div v-if="cronConfig.frequency === 'weekly'" class="cron-field">
                  <label class="cron-label">执行星期</label>
                  <select v-model="cronConfig.dayOfWeek" @change="generateCron" class="ctrl cron-select">
                    <option value="1">周一</option>
                    <option value="2">周二</option>
                    <option value="3">周三</option>
                    <option value="4">周四</option>
                    <option value="5">周五</option>
                    <option value="6">周六</option>
                    <option value="7">周日</option>
                  </select>
                </div>

                <!-- 日期选择 -->
                <div v-if="cronConfig.frequency === 'monthly'" class="cron-field">
                  <label class="cron-label">执行日期</label>
                  <select v-model="cronConfig.dayOfMonth" @change="generateCron" class="ctrl cron-select">
                    <option v-for="d in 31" :key="d" :value="d">{{ d }}号</option>
                  </select>
                </div>

                <!-- 间隔执行 -->
                <div v-if="cronConfig.frequency === 'hourly' || cronConfig.frequency === 'minute'" class="cron-field">
                  <label class="cron-label">间隔时间</label>
                  <div class="interval-input-wrapper">
                    <input
                      v-model.number="cronConfig.interval"
                      type="number"
                      min="1"
                      :max="cronConfig.frequency === 'hourly' ? 23 : 59"
                      @change="generateCron"
                      class="ctrl cron-interval-input"
                    />
                    <span class="interval-unit">{{ cronConfig.frequency === 'hourly' ? '小时' : '分钟' }}</span>
                  </div>
                </div>
              </div>

              <!-- 生成结果 -->
              <div class="cron-result">
                <div class="cron-result-label">生成的 Cron 表达式</div>
                <div class="cron-result-value">{{ generatedCron }}</div>
                <button type="button" class="btn btn-primary btn-sm apply-cron-btn" @click="applyGeneratedCron">
                  ✓ 应用此表达式
                </button>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label for="taskType">执行几小时内的数据 *</label>
            <select id="taskType" v-model="formData.hour" required>
              <option v-for="h in 24" :value="h">{{h}}小时内</option>
            </select>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="formData.enabled" type="checkbox" />
              启用任务
            </label>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>

    <!-- 确认对话框 -->
    <div v-if="showConfirmDialog" class="modal-overlay" @click="closeConfirmDialog">
      <div class="confirm-dialog" @click.stop>
        <div class="confirm-icon">⚠️</div>
        <div class="confirm-title">确认操作</div>
        <div class="confirm-message">{{ confirmMessage }}</div>
        <div class="confirm-actions">
          <button class="btn btn-ghost" @click="closeConfirmDialog">取消</button>
          <button class="btn btn-primary" @click="handleConfirm">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  getTaskList,
  getTaskDetail,
  createTask,
  updateTask,
  deleteTaskApi,
  toggleTaskEnabled,
  executeTaskApi,
  cancelTaskApi,
  quickSyncApi
} from '@/utils/api'

const router = useRouter()
const tasks = ref([])
const loading = ref(false)
const showModal = ref(false)
const modalTitle = ref('创建定时任务')
const currentTaskId = ref(null)

const formData = reactive({
  taskName: '',
  taskType: 25,
  cronExpression: '0 0 2 * * ?',
  enabled: true
})

const toast = reactive({
  show: false,
  message: '',
  type: 'success'
})

// 确认对话框
const showConfirmDialog = ref(false)
const confirmMessage = ref('')
const confirmCallback = ref(null)

// Cron 表达式生成器
const showCronGenerator = ref(false)
const generatedCron = ref('0 0 2 * * ?')

const cronConfig = reactive({
  frequency: 'daily',
  hour: 2,
  minute: 0,
  dayOfWeek: '1',
  dayOfMonth: 1,
  interval: 6
})

// 生成 Cron 表达式
const generateCron = () => {
  let cron = ''
  const { frequency, hour, minute, dayOfWeek, dayOfMonth, interval } = cronConfig

  switch (frequency) {
    case 'minute':
      cron = `0 */${interval} * * * ?`
      break
    case 'hourly':
      cron = `0 */${interval} * * * ?`
      break
    case 'daily':
      cron = `0 ${minute} ${hour} * * ?`
      break
    case 'weekly':
      cron = `0 ${minute} ${hour} * * ${dayOfWeek}`
      break
    case 'monthly':
      cron = `0 ${minute} ${hour} ${dayOfMonth} * ?`
      break
  }

  generatedCron.value = cron
}

// 应用快捷模板
const applyPreset = (preset) => {
  formData.cronExpression = preset
  showCronGenerator.value = false
}

// 应用生成的 Cron 表达式
const applyGeneratedCron = () => {
  formData.cronExpression = generatedCron.value
  showCronGenerator.value = false
}

// 初始化生成
generateCron()

// 显示 Toast 提示
const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

// 加载任务列表
const loadTasks = async () => {
  try {
    loading.value = true
    const res = await getTaskList()
    tasks.value = res.data || []
  } catch (error) {
    showToast('加载失败: ' + (error.message || '未知错误'), 'error')
  } finally {
    loading.value = false
  }
}

// 获取类型名称
const getTypeName = (type) => {
  const types = { 25: '日本动漫', 26: '欧美动漫', 24: '中国动漫' }
  return types[type] || '未知'
}

// 获取状态名称
const getStatusName = (status) => {
  if (!status) return '待执行'
  const statusMap = {
    PENDING: '待执行',
    RUNNING: '运行中',
    COMPLETED: '已完成',
    FAILED: '执行失败',
    CANCELLED: '已取消'
  }
  return statusMap[status] || status.description || '未知'
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

// 打开创建模态框
const openCreateModal = () => {
  currentTaskId.value = null
  modalTitle.value = '创建定时任务'
  Object.assign(formData, {
    taskName: '',
    taskType: 24,
    cronExpression: '0 */6 * * * ?',
    enabled: true,
    hour: 6
  })
  showModal.value = true
}

// 打开编辑模态框
const openEditModal = async (taskId) => {
  try {
    const res = await getTaskDetail(taskId)
    const task = res.data
    currentTaskId.value = taskId
    modalTitle.value = '编辑定时任务'
    Object.assign(formData, {
      taskName: task.taskName,
      taskType: task.taskType,
      cronExpression: task.cronExpression,
      enabled: task.enabled,
      hour: task.hour
    })
    showModal.value = true
  } catch (error) {
    showToast('获取任务信息失败: ' + (error.message || '未知错误'), 'error')
  }
}

// 关闭模态框
const closeModal = () => {
  showModal.value = false
}

// 保存任务
const saveTask = async () => {
  try {
    if (currentTaskId.value) {
      await updateTask(currentTaskId.value, formData)
      showToast('更新成功')
    } else {
      await createTask(formData)
      showToast('创建成功')
    }
    closeModal()
    loadTasks()
  } catch (error) {
    showToast('保存失败: ' + (error.message || '未知错误'), 'error')
  }
}

// 删除任务
const deleteTask = async (taskId) => {
  showConfirm('确定要删除这个任务吗?', async () => {
    try {
      await deleteTaskApi(taskId)
      showToast('删除成功')
      loadTasks()
    } catch (error) {
      showToast('删除失败: ' + (error.message || '未知错误'), 'error')
    }
  })
}

// 启用/禁用任务
const toggleTask = async (taskId, enabled) => {
  try {
    await toggleTaskEnabled(taskId, enabled)
    showToast(enabled ? '已启用' : '已禁用')
    loadTasks()
  } catch (error) {
    showToast('操作失败: ' + (error.message || '未知错误'), 'error')
  }
}

// 显示确认对话框
const showConfirm = (message, callback) => {
  confirmMessage.value = message
  confirmCallback.value = callback
  showConfirmDialog.value = true
}

// 关闭确认对话框
const closeConfirmDialog = () => {
  showConfirmDialog.value = false
  confirmMessage.value = ''
  confirmCallback.value = null
}

// 处理确认
const handleConfirm = () => {
  if (confirmCallback.value) {
    confirmCallback.value()
  }
  closeConfirmDialog()
}

// 立即执行任务
const executeTask = async (taskId) => {
  showConfirm('确定要立即执行这个任务吗?', async () => {
    try {
      await executeTaskApi(taskId)
      showToast('任务已启动执行')
      setTimeout(loadTasks, 2000)
    } catch (error) {
      showToast('执行失败: ' + (error.message || '未知错误'), 'error')
    }
  })
}

// 取消任务
const cancelTask = async (taskId) => {
  showConfirm('确定要取消这个任务吗?', async () => {
    try {
      await cancelTaskApi(taskId)
      showToast('任务已取消')
      loadTasks()
    } catch (error) {
      showToast('取消失败: ' + (error.message || '未知错误'), 'error')
    }
  })
}

// 快速同步
const quickSync = async (type) => {
  const typeNames = { 25: '日本动漫', 26: '欧美动漫', 24: '中国动漫' }
  showConfirm(`确定要启动${typeNames[type]}同步任务吗?`, async () => {
    try {
      const res = await quickSyncApi(type)
      showToast(res.data || '同步任务已启动')
    } catch (error) {
      showToast('同步失败: ' + (error.message || '未知错误'), 'error')
    }
  })
}

// 跳转到执行记录页面
const goToLogs = () => {
  router.push('/task-logs')
}

// 页面加载时获取任务列表,每30秒自动刷新
onMounted(() => {
  loadTasks()
  setInterval(loadTasks, 30000)
})
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-icon {
  margin-right: 4px;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.type-25 {
  background: rgba(236, 72, 153, 0.12);
  color: #f472b6;
}

.type-26 {
  background: rgba(249, 115, 22, 0.12);
  color: #fb923c;
}

.type-24 {
  background: rgba(99, 102, 241, 0.12);
  color: #818cf8;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.status-pending {
  background: rgba(240, 180, 41, 0.12);
  color: var(--gold);
}

.status-running {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
}

.status-completed {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
}

.status-failed {
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
}

.status-cancelled {
  background: rgba(255, 255, 255, 0.06);
  color: var(--sub);
}

.enabled-badge {
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.enabled-true {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
}

.enabled-false {
  background: rgba(255, 255, 255, 0.06);
  color: var(--sub);
}

.action-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.btn-xs {
  padding: 6px 12px;
  font-size: 12px;
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

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  font-size: 20px;
  color: #fff;
  margin: 0;
  font-weight: 700;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: var(--sub);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.18s;
}

.modal-close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text);
  font-size: 13px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg3);
  color: var(--text);
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--accent);
}

.form-group input::placeholder {
  color: var(--sub);
}

/* Cron 输入框包装器 */
.cron-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.cron-input-wrapper input {
  flex: 1;
}

.cron-generator-btn {
  white-space: nowrap;
  flex-shrink: 0;
}

/* Cron 表达式生成器 */
.cron-generator {
  margin-top: 16px;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cron-generator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.cron-generator-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.close-generator {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--sub);
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.18s;
}

.close-generator:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text);
}

.cron-section {
  margin-bottom: 20px;
}

.cron-section:last-of-type {
  margin-bottom: 16px;
}

.cron-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent2);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 快捷模板 */
.cron-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.preset-btn {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 10px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  color: var(--text);
  font-family: inherit;
}

.preset-btn:hover {
  border-color: var(--accent);
  background: rgba(124, 106, 247, 0.08);
  transform: translateY(-2px);
}

.preset-icon {
  font-size: 20px;
  margin-bottom: 6px;
}

.preset-text {
  font-size: 12px;
  color: var(--sub);
  line-height: 1.3;
}

/* 自定义字段 */
.cron-field {
  margin-bottom: 14px;
}

.cron-field:last-child {
  margin-bottom: 0;
}

.cron-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--sub);
  margin-bottom: 6px;
}

.cron-select {
  width: 100%;
  padding: 8px 10px;
  font-size: 13px;
}

/* 间隔输入框 */
.interval-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cron-interval-input {
  width: 100px;
  padding: 8px 10px;
  font-size: 13px;
}

.interval-unit {
  font-size: 13px;
  color: var(--sub);
}

/* 生成结果 */
.cron-result {
  background: var(--bg2);
  border: 1px solid var(--accent);
  border-radius: 8px;
  padding: 14px;
  margin-top: 16px;
}

.cron-result-label {
  font-size: 12px;
  color: var(--sub);
  margin-bottom: 6px;
}

.cron-result-value {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 18px;
  font-weight: 700;
  color: var(--accent2);
  padding: 8px 12px;
  background: var(--bg3);
  border-radius: 6px;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.apply-cron-btn {
  width: 100%;
}

.form-hint {
  color: var(--sub);
  display: block;
  margin-top: 6px;
  font-size: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text);
  font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
  accent-color: var(--accent);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

/* Toast 提示 */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  z-index: 2000;
  animation: slideIn 0.3s ease;
  font-weight: 500;
  color: var(--text);
  font-size: 14px;
}

.toast.success {
  border-left: 4px solid #4ade80;
}

.toast.error {
  border-left: 4px solid #f87171;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 确认对话框 */
.confirm-dialog {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  animation: scaleIn 0.2s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.confirm-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.confirm-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
}

.confirm-message {
  font-size: 14px;
  color: var(--sub);
  margin-bottom: 24px;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-actions .btn {
  min-width: 100px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
  }

  table {
    font-size: 12px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .cron-presets {
    grid-template-columns: repeat(2, 1fr);
  }

  .cron-input-wrapper {
    flex-direction: column;
  }

  .cron-generator-btn {
    width: 100%;
  }
}
</style>
