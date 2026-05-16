<template>
  <div class="task-logs">
    <!-- 筛选栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" class="search-form">
        <el-form-item label="任务ID">
          <el-input-number
            v-model="filterTaskId"
            placeholder="输入任务ID筛选"
            :min="0"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadLogs">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilter">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 记录列表 -->
    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="logs" border stripe style="width: 100%">
        <el-table-column prop="id" label="记录ID" width="100" />
        <el-table-column prop="taskId" label="任务ID" width="100" />
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
        <el-table-column label="开始时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" min-width="180">
          <template #default="{ row }">
            {{ row.endTime ? formatDateTime(row.endTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="信息" min-width="200">
          <template #default="{ row }">
            <span :title="row.message">{{ row.message || '-' }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div v-if="logs.length > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="loadLogs"
        />
      </div>

      <el-empty v-else-if="!loading" description="暂无执行记录" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Search, Refresh } from '@element-plus/icons-vue'
  import { getTaskLogs } from '@/utils/api'

  const logs = ref<any[]>([])
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const filterTaskId = ref<number | null>(null)

  // 获取类型名称
  const getTypeName = (type: number) => {
    const types: Record<number, string> = { 66: '中文动漫', 67: '日韩动漫', 68: '欧美动漫' }
    return types[type] || '未知'
  }

  // 获取状态名称
  const getStatusName = (status?: string) => {
    if (!status) {
      return '未知'
    }
    const statusMap: Record<string, string> = {
      RUNNING: '执行中',
      SUCCESS: '执行成功',
      FAILED: '执行失败',
      CANCELLED: '已取消'
    }
    return statusMap[status] || status
  }

  // 获取状态类型
  const getStatusType = (status?: string): 'success' | 'warning' | 'danger' | 'info' => {
    const typeMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      RUNNING: 'warning',
      SUCCESS: 'success',
      FAILED: 'danger',
      CANCELLED: 'info'
    }
    return typeMap[status || ''] || 'info'
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

  // 加载执行记录
  const loadLogs = async () => {
    try {
      loading.value = true
      const params: any = {
        pageNum: currentPage.value,
        pageSize: pageSize.value
      }
      if (filterTaskId.value) {
        params.taskId = filterTaskId.value
      }

      const res = await getTaskLogs(params)
      logs.value = res.data.records || []
      total.value = res.data.total || 0
    } catch (error: any) {
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

  // 页面加载时获取记录
  onMounted(() => {
    loadLogs()
  })
</script>

<style scoped>
  .task-logs {
    padding: 24px;
  }

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    margin-bottom: 20px;
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
</style>
