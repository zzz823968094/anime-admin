<template>
  <div class="task-manager">
    <!-- 工具栏 -->
    <el-card shadow="never" class="toolbar-card">
      <template #header>
        <div class="card-header">快速操作</div>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-button type="primary" @click="openCreateModal">
            <el-icon><Plus /></el-icon>
            创建任务
          </el-button>
          <el-button @click="loadTasks">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button @click="goToLogs">
            <el-icon><Document /></el-icon>
            执行记录
          </el-button>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-button type="success" @click="quickSync(67, 44)">日韩动漫(24H内数据同步)</el-button>
          <el-button type="warning" @click="quickSync(68, 9)">欧美动漫(24H内数据同步)</el-button>
          <el-button type="primary" @click="quickSync(66, 47)">中文动漫(24H内数据同步)</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 任务列表表格 -->
    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="tasks" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="taskName" label="任务名称" min-width="150">
          <template #default="{ row }">
            <strong>{{ row.taskName }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="任务类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getTypeName(row.taskType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Cron 表达式" width="150">
          <template #default="{ row }">
            <code>{{ row.cronExpression }}</code>
          </template>
        </el-table-column>
        <el-table-column label="小时" width="120">
          <template #default="{ row }">
            <code>{{ row.hour }}H内数据</code>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="启用" width="80">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
              {{ row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="上次执行" width="180">
          <template #default="{ row }">
            {{ row.lastExecuteTime ? formatDateTime(row.lastExecuteTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="下次执行" width="180">
          <template #default="{ row }">
            {{ row.nextExecuteTime ? formatDateTime(row.nextExecuteTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="typeof row.status === 'string' ? row.status === 'RUNNING' : row.status?.name === 'RUNNING'"
              link
              type="danger"
              size="small"
              @click="cancelTask(row.id)"
            >
              取消
            </el-button>
            <el-button v-else link type="success" size="small" @click="executeTask(row.id)">
              执行
            </el-button>
            <el-button link type="primary" size="small" @click="openEditModal(row.id)">
              编辑
            </el-button>
            <el-button
              link
              :type="row.enabled ? 'warning' : 'success'"
              size="small"
              @click="toggleTask(row.id, !row.enabled)"
            >
              {{ row.enabled ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" size="small" @click="deleteTask(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && tasks.length === 0" description="暂无定时任务">
        <template #image>
          <el-icon :size="100"><Document /></el-icon>
        </template>
        <p>点击"创建任务"按钮添加新的定时任务</p>
      </el-empty>
    </el-card>

    <!-- 创建/编辑任务对话框 -->
    <el-dialog v-model="showModal" :title="modalTitle" width="700px" @close="closeModal">
      <el-form :model="formData" label-width="120px">
        <el-form-item label="任务名称" required>
          <el-input v-model="formData.taskName" placeholder="例如:中文动漫每日同步" />
        </el-form-item>
        <el-form-item label="任务类型" required>
          <el-select v-model="formData.taskType" style="width: 100%">
            <el-option label="日韩动漫" :value="67" />
            <el-option label="欧美动漫" :value="68" />
            <el-option label="中文动漫" :value="66" />
          </el-select>
        </el-form-item>
        <el-form-item label="Cron 表达式" required>
          <el-input v-model="formData.cronExpression" placeholder="例如:0 0 2 * * ?">
            <template #append>
              <el-button @click="showCronGenerator = !showCronGenerator">🛠️ 生成器</el-button>
            </template>
          </el-input>
          <div class="form-hint">示例:0 0 2 * * ? (每天凌晨2点) | 0 */6 * * * ? (每6小时)</div>

          <!-- Cron 表达式生成器 -->
          <el-collapse-transition>
            <div v-if="showCronGenerator" class="cron-generator mt-3">
              <el-card shadow="never">
                <template #header>
                  <div class="generator-header">
                    <h4>Cron 表达式生成器</h4>
                    <el-button link @click="showCronGenerator = false">
                      <el-icon><Close /></el-icon>
                    </el-button>
                  </div>
                </template>

                <!-- 快捷模板 -->
                <div class="cron-section mb-3">
                  <div class="section-title">快捷模板</div>
                  <el-row :gutter="10">
                    <el-col v-for="preset in cronPresets" :key="preset.value" :span="6">
                      <el-button class="preset-btn" @click="applyPreset(preset.value)">
                        <div class="preset-icon">{{ preset.icon }}</div>
                        <div class="preset-text">{{ preset.label }}</div>
                      </el-button>
                    </el-col>
                  </el-row>
                </div>

                <!-- 自定义生成 -->
                <div class="cron-section mb-3">
                  <div class="section-title">自定义配置</div>

                  <el-form label-width="100px">
                    <el-form-item label="执行周期">
                      <el-select
                        v-model="cronConfig.frequency"
                        style="width: 100%"
                        @change="generateCron"
                      >
                        <el-option label="每分钟" value="minute" />
                        <el-option label="每小时" value="hourly" />
                        <el-option label="每天" value="daily" />
                        <el-option label="每周" value="weekly" />
                        <el-option label="每月" value="monthly" />
                      </el-select>
                    </el-form-item>

                    <el-form-item
                      v-if="['daily', 'weekly', 'monthly'].includes(cronConfig.frequency)"
                      label="执行小时"
                    >
                      <el-select
                        v-model="cronConfig.hour"
                        style="width: 100%"
                        @change="generateCron"
                      >
                        <el-option v-for="h in 24" :key="h" :label="`${h - 1}点`" :value="h - 1" />
                      </el-select>
                    </el-form-item>

                    <el-form-item v-if="cronConfig.frequency !== 'minute'" label="执行分钟">
                      <el-select
                        v-model="cronConfig.minute"
                        style="width: 100%"
                        @change="generateCron"
                      >
                        <el-option v-for="m in 60" :key="m" :label="`${m - 1}分`" :value="m - 1" />
                      </el-select>
                    </el-form-item>

                    <el-form-item v-if="cronConfig.frequency === 'weekly'" label="执行星期">
                      <el-select
                        v-model="cronConfig.dayOfWeek"
                        style="width: 100%"
                        @change="generateCron"
                      >
                        <el-option label="周一" value="1" />
                        <el-option label="周二" value="2" />
                        <el-option label="周三" value="3" />
                        <el-option label="周四" value="4" />
                        <el-option label="周五" value="5" />
                        <el-option label="周六" value="6" />
                        <el-option label="周日" value="7" />
                      </el-select>
                    </el-form-item>

                    <el-form-item v-if="cronConfig.frequency === 'monthly'" label="执行日期">
                      <el-select
                        v-model="cronConfig.dayOfMonth"
                        style="width: 100%"
                        @change="generateCron"
                      >
                        <el-option v-for="d in 31" :key="d" :label="`${d}号`" :value="d" />
                      </el-select>
                    </el-form-item>

                    <el-form-item
                      v-if="['hourly', 'minute'].includes(cronConfig.frequency)"
                      label="间隔时间"
                    >
                      <el-input-number
                        v-model="cronConfig.interval"
                        :min="1"
                        :max="cronConfig.frequency === 'hourly' ? 23 : 59"
                        style="width: 150px"
                        @change="generateCron"
                      />
                      <span class="ml-2">
                        {{ cronConfig.frequency === 'hourly' ? '小时' : '分钟' }}
                      </span>
                    </el-form-item>
                  </el-form>
                </div>

                <!-- 生成结果 -->
                <div class="cron-result">
                  <div class="result-label">生成的 Cron 表达式</div>
                  <div class="result-value">{{ generatedCron }}</div>
                  <el-button type="primary" @click="applyGeneratedCron">
                    <el-icon><Check /></el-icon>
                    应用此表达式
                  </el-button>
                </div>
              </el-card>
            </div>
          </el-collapse-transition>
        </el-form-item>
        <el-form-item label="执行几小时内的数据" required>
          <el-select v-model="formData.hour" style="width: 100%">
            <el-option v-for="h in 24" :key="h" :label="`${h}小时内`" :value="h" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="formData.enabled">启用任务</el-checkbox>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeModal">取消</el-button>
        <el-button type="primary" @click="saveTask">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus, Refresh, Document, Close, Check } from '@element-plus/icons-vue'
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
  const tasks = ref<any[]>([])
  const loading = ref(false)
  const showModal = ref(false)
  const modalTitle = ref('创建定时任务')
  const currentTaskId = ref<number | null>(null)

  const formData = reactive({
    taskName: '',
    taskType: 66,
    cronExpression: '0 0 2 * * ?',
    enabled: true,
    hour: 6
  })

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

  const cronPresets = [
    { icon: '🌙', label: '每天凌晨2点', value: '0 0 2 * * ?' },
    { icon: '☀️', label: '每天中午12点', value: '0 0 12 * * ?' },
    { icon: '⏰', label: '每6小时', value: '0 */6 * * * ?' },
    { icon: '🕐', label: '每小时', value: '0 0 * * * ?' },
    { icon: '⚡', label: '每30分钟', value: '0 */30 * * * ?' },
    { icon: '💼', label: '工作时间(9-18点)', value: '0 0 9-18 * * ?' },
    { icon: '📅', label: '每周一10点', value: '0 0 10 * * 1' },
    { icon: '🎉', label: '每月1号凌晨1点', value: '0 0 1 1 * ?' }
  ]

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
  const applyPreset = (preset: string) => {
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

  // 加载任务列表
  const loadTasks = async () => {
    try {
      loading.value = true
      const res = await getTaskList()
      tasks.value = res.data || []
    } catch (error: any) {
      ElMessage.error('加载失败: ' + (error.message || '未知错误'))
    } finally {
      loading.value = false
    }
  }

  // 获取类型名称
  const getTypeName = (type: number) => {
    const types: Record<number, string> = { 67: '日韩动漫', 68: '欧美动漫', 66: '中文动漫' }
    return types[type] || '未知'
  }

  // 获取状态名称
  const getStatusName = (status?: any) => {
    if (!status) {
      return '待执行'
    }
    
    // 兼容字符串和对象两种格式
    const statusValue = typeof status === 'string' ? status : status.name
    
    const statusMap: Record<string, string> = {
      PENDING: '待执行',
      RUNNING: '运行中',
      COMPLETED: '已完成',
      FAILED: '执行失败',
      CANCELLED: '已取消'
    }
    return statusMap[statusValue] || '未知'
  }

  // 获取状态类型
  const getStatusType = (status?: any): 'success' | 'warning' | 'danger' | 'info' => {
    if (!status) {
      return 'info'
    }
    
    // 兼容字符串和对象两种格式
    const statusValue = typeof status === 'string' ? status : status.name
    
    const typeMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      PENDING: 'info',
      RUNNING: 'warning',
      COMPLETED: 'success',
      FAILED: 'danger',
      CANCELLED: 'info'
    }
    return typeMap[statusValue] || 'info'
  }

  // 格式化日期时间
  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) {
      return '-'
    }
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
      taskType: 66,
      cronExpression: '0 */6 * * * ?',
      enabled: true,
      hour: 6
    })
    showModal.value = true
  }

  // 打开编辑模态框
  const openEditModal = async (taskId: number) => {
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
    } catch (error: any) {
      ElMessage.error('获取任务信息失败: ' + (error.message || '未知错误'))
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
        ElMessage.success('更新成功')
      } else {
        await createTask(formData)
        ElMessage.success('创建成功')
      }
      closeModal()
      await loadTasks()
    } catch (error: any) {
      ElMessage.error('保存失败: ' + (error.message || '未知错误'))
    }
  }

  // 执行任务
  const executeTask = async (taskId: number) => {
    try {
      await ElMessageBox.confirm('确定要立即执行该任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await executeTaskApi(taskId)
      ElMessage.success('任务已启动')
      await loadTasks()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error('执行失败: ' + (error.message || '未知错误'))
      }
    }
  }

  // 取消任务
  const cancelTask = async (taskId: number) => {
    try {
      await ElMessageBox.confirm('确定要取消该任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await cancelTaskApi(taskId)
      ElMessage.success('任务已取消')
      await loadTasks()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error('取消失败: ' + (error.message || '未知错误'))
      }
    }
  }

  // 切换任务启用状态
  const toggleTask = async (taskId: number, enabled: boolean) => {
    try {
      await toggleTaskEnabled(taskId, enabled)
      ElMessage.success(enabled ? '已启用' : '已禁用')
      await loadTasks()
    } catch (error: any) {
      ElMessage.error('操作失败: ' + (error.message || '未知错误'))
    }
  }

  // 删除任务
  const deleteTask = async (taskId: number) => {
    try {
      await ElMessageBox.confirm('确定要删除该任务吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteTaskApi(taskId)
      ElMessage.success('删除成功')
      await loadTasks()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败: ' + (error.message || '未知错误'))
      }
    }
  }

  // 快速同步
  const quickSync = async (type: number, hour: number) => {
    try {
      const typeName = getTypeName(type)
      await ElMessageBox.confirm(`确定要同步${typeName}${hour}小时内的数据吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      })
      await quickSyncApi(type, hour)
      ElMessage.success('同步任务已启动')
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error('同步失败: ' + (error.message || '未知错误'))
      }
    }
  }

  // 跳转到执行记录
  const goToLogs = () => {
    router.push({ name: 'TaskLogs' })
  }

  onMounted(() => {
    loadTasks()
  })
</script>

<style scoped>
  .task-manager {
    padding: 24px;
  }

  .toolbar-card,
  .table-card {
    margin-bottom: 20px;
  }

  .card-header {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .text-right {
    text-align: right;
  }

  .form-hint {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 5px;
  }

  .mt-3 {
    margin-top: 15px;
  }

  .mb-3 {
    margin-bottom: 15px;
  }

  .ml-2 {
    margin-left: 10px;
  }

  .generator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .generator-header h4 {
    margin: 0;
    font-size: 16px;
    color: var(--el-text-color-primary);
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 10px;
  }

  .preset-btn {
    width: 100%;
    height: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  .preset-icon {
    font-size: 24px;
  }

  .preset-text {
    font-size: 12px;
  }

  .cron-result {
    background: var(--el-fill-color-light);
    padding: 15px;
    border-radius: 8px;
    text-align: center;
  }

  .result-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 5px;
  }

  .result-value {
    font-family: monospace;
    font-size: 16px;
    color: var(--el-text-color-primary);
    margin-bottom: 10px;
  }
</style>
