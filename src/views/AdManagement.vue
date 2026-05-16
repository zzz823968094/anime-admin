<template>
  <div class="ad-management">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="广告位编码">
          <el-input
            v-model="searchForm.positionCode"
            placeholder="广告位编码"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增广告
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="list" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="标题" min-width="150">
          <template #default="{ row }">
            <div>{{ row.title || '-' }}</div>
            <div v-if="row.subtitle" class="subtitle">{{ row.subtitle }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="positionCode" label="广告位" width="120" />
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.imageUrl"
              :src="row.imageUrl"
              fit="cover"
              style="width: 60px; height: 40px"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="链接" min-width="150">
          <template #default="{ row }">
            <a v-if="row.linkValue" :href="row.linkValue" target="_blank" class="link-text">
              {{ truncateText(row.linkValue, 20) }}
            </a>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80" />
        <el-table-column label="排序" width="80">
          <template #default="{ row }">
            <el-tag size="small">{{ row.sortOrder || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="展示/点击" width="120">
          <template #default="{ row }">
            <div>展示: {{ row.impressionCount || 0 }}</div>
            <div>点击: {{ row.clickCount || 0 }}</div>
          </template>
        </el-table-column>
        <el-table-column label="有效期" min-width="180">
          <template #default="{ row }">
            <div v-if="row.startTime">{{ formatDate(row.startTime) }}</div>
            <div v-if="row.endTime">至 {{ formatDate(row.endTime) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" size="small" @click="handleManageStrategy(row)">
              策略
            </el-button>
            <el-button
              link
              :type="row.status === 1 ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchList"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="modalVisible"
      :title="editingId ? '编辑广告' : '新增广告'"
      width="700px"
      @close="resetForm"
    >
      <el-form :model="form" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="广告位编码" required>
              <el-select v-model="form.positionCode" placeholder="请选择广告位" style="width: 100%">
                <el-option
                  v-for="pos in adPositions"
                  :key="pos.id"
                  :label="`${pos.positionName} (${pos.positionCode})`"
                  :value="pos.positionCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标题" required>
              <el-input v-model="form.title" placeholder="广告标题" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="副标题">
          <el-input v-model="form.subtitle" placeholder="广告副标题" />
        </el-form-item>

        <el-form-item label="图片 URL" required>
          <el-input v-model="form.imageUrl" placeholder="广告图片URL" />
          <el-image
            v-if="form.imageUrl"
            :src="form.imageUrl"
            fit="cover"
            style="width: 200px; height: 120px; margin-top: 10px"
          />
        </el-form-item>

        <el-form-item label="视频 URL">
          <el-input v-model="form.videoUrl" placeholder="广告视频URL（视频类型时使用）" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="链接类型" required>
              <el-select v-model="form.linkType" style="width: 100%">
                <el-option label="外部链接" value="URL" />
                <el-option label="番剧详情" value="ANIME" />
                <el-option label="搜索结果" value="SEARCH" />
                <el-option label="无跳转" value="NONE" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="链接值">
              <el-input v-model="form.linkValue" placeholder="URL地址/番剧ID/搜索关键词" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" required>
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                placeholder="选择开始时间"
                style="width: 100%"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" required>
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                placeholder="选择结束时间"
                style="width: 100%"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级">
              <el-input-number
                v-model="form.priority"
                :min="0"
                placeholder="数字越大优先级越高"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number
                v-model="form.sortOrder"
                :min="0"
                placeholder="数字越小越靠前"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标用户类型">
              <el-select v-model="form.targetType" style="width: 100%">
                <el-option label="全部用户" value="ALL" />
                <el-option label="新用户" value="NEW" />
                <el-option label="VIP用户" value="VIP" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 策略管理对话框 -->
    <el-dialog
      v-model="strategyModalVisible"
      :title="`广告投放策略 - ${currentAdTitle}`"
      width="800px"
    >
      <div class="strategy-header mb-3">
        <el-button type="primary" size="small" @click="handleAddStrategy">
          <el-icon><Plus /></el-icon>
          新增策略
        </el-button>
      </div>

      <el-table v-loading="strategyLoading" :data="strategies" border stripe>
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            {{ getStrategyTypeName(row.strategyType) }}
          </template>
        </el-table-column>
        <el-table-column prop="strategyValue" label="值" min-width="200" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEditStrategy(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDeleteStrategy(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!strategyLoading && strategies.length === 0" description="暂无策略" />
    </el-dialog>

    <!-- 策略编辑对话框 -->
    <el-dialog
      v-model="strategyFormVisible"
      :title="editingStrategyId ? '编辑策略' : '新增策略'"
      width="500px"
    >
      <el-form :model="strategyForm" label-width="100px">
        <el-form-item label="策略类型" required>
          <el-select v-model="strategyForm.strategyType" placeholder="请选择" style="width: 100%">
            <el-option label="时间定向" value="time" />
            <el-option label="地区定向" value="region" />
            <el-option label="设备定向" value="device" />
            <el-option label="用户定向" value="user" />
            <el-option label="频次控制" value="frequency" />
          </el-select>
        </el-form-item>

        <el-form-item label="策略值" required>
          <el-input v-model="strategyForm.strategyValue" placeholder="根据类型填写相应值" />
          <div class="form-hint">
            时间: 如 "09:00-18:00" | 地区: 如 "北京,上海" | 设备: 如 "ios,android" | 用户: 如
            "vip,new" | 频次: 如 "3/day"
          </div>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="strategyForm.status" style="width: 100%">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="strategyFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="strategySubmitting" @click="handleSubmitStrategy">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import { getAdList, createAd, updateAd, deleteAd } from '@/api/advertisement'
  import {
    getStrategiesByAdId,
    createStrategy,
    updateStrategy,
    deleteStrategy
  } from '@/api/adStrategy'
  import { getActivePositions } from '@/api/adPosition'

  const loading = ref(false)
  const list = ref<any[]>([])
  const pagination = reactive({ current: 1, pageSize: 10, total: 0, pages: 1 })
  const searchForm = reactive({ positionCode: '', status: '' })

  // 广告位列表
  const adPositions = ref<any[]>([])

  const modalVisible = ref(false)
  const editingId = ref<number | null>(null)
  const submitting = ref(false)

  const form = reactive({
    id: null,
    positionCode: '',
    title: '',
    subtitle: '',
    imageUrl: '',
    videoUrl: '',
    htmlContent: '',
    linkType: 'URL',
    linkValue: '',
    startTime: '',
    endTime: '',
    targetType: 'ALL',
    priority: 0,
    status: 1,
    sortOrder: 0,
    extraData: ''
  })

  async function fetchList() {
    loading.value = true
    try {
      const res = await getAdList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        positionCode: searchForm.positionCode || undefined,
        status: searchForm.status || undefined
      })
      if (res.code === 200) {
        list.value = res.data.records
        pagination.total = res.data.total
        pagination.pages = res.data.pages
      }
    } catch (e: any) {
      console.error('获取广告列表失败:', e)
      ElMessage.error('获取列表失败')
    } finally {
      loading.value = false
    }
  }

  // 获取启用的广告位列表
  async function fetchAdPositions() {
    try {
      const res = await getActivePositions()
      if (res.code === 200) {
        adPositions.value = res.data || []
      }
    } catch (e: any) {
      console.error('获取广告位列表失败:', e)
    }
  }

  function handleSearch() {
    pagination.current = 1
    fetchList()
  }

  function handleReset() {
    searchForm.positionCode = ''
    searchForm.status = ''
    pagination.current = 1
    fetchList()
  }

  function handlePageChange(page: number) {
    pagination.current = page
    fetchList()
  }

  function handlePageSizeChange() {
    pagination.current = 1
    fetchList()
  }

  function handleAdd() {
    editingId.value = null
    resetForm()
    modalVisible.value = true
  }

  function handleEdit(item: any) {
    editingId.value = item.id
    Object.assign(form, {
      id: item.id,
      positionCode: item.positionCode,
      title: item.title,
      subtitle: item.subtitle || '',
      imageUrl: item.imageUrl,
      videoUrl: item.videoUrl || '',
      htmlContent: item.htmlContent || '',
      linkType: item.linkType,
      linkValue: item.linkValue || '',
      startTime: item.startTime,
      endTime: item.endTime,
      targetType: item.targetType,
      priority: item.priority || 0,
      status: item.status,
      sortOrder: item.sortOrder || 0,
      extraData: item.extraData || ''
    })
    modalVisible.value = true
  }

  function resetForm() {
    Object.assign(form, {
      id: null,
      positionCode: '',
      title: '',
      subtitle: '',
      imageUrl: '',
      videoUrl: '',
      htmlContent: '',
      linkType: 'URL',
      linkValue: '',
      startTime: '',
      endTime: '',
      targetType: 'ALL',
      priority: 0,
      status: 1,
      sortOrder: 0,
      extraData: ''
    })
  }

  async function handleSubmit() {
    try {
      submitting.value = true
      if (editingId.value) {
        await updateAd(editingId.value, form)
        ElMessage.success('更新成功')
      } else {
        await createAd(form)
        ElMessage.success('创建成功')
      }
      modalVisible.value = false
      fetchList()
    } catch (e: any) {
      ElMessage.error(e.message || '保存失败')
    } finally {
      submitting.value = false
    }
  }

  async function handleToggleStatus(item: any) {
    try {
      const newStatus = item.status === 1 ? 0 : 1
      await updateAd(item.id, { ...item, status: newStatus })
      ElMessage.success(newStatus === 1 ? '已启用' : '已禁用')
      fetchList()
    } catch (e: any) {
      ElMessage.error(e.message || '操作失败')
    }
  }

  async function handleDelete(item: any) {
    try {
      await ElMessageBox.confirm(`确定删除广告 "${item.title}"？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteAd(item.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (e: any) {
      if (e !== 'cancel') {
        ElMessage.error(e.message || '删除失败')
      }
    }
  }

  function truncateText(text: string, maxLength: number) {
    if (!text) {
      return '-'
    }
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  function formatDate(dateStr: string) {
    if (!dateStr) {
      return '-'
    }
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN')
  }

  // 策略管理
  const strategyModalVisible = ref(false)
  const strategyFormVisible = ref(false)
  const strategyLoading = ref(false)
  const strategies = ref<any[]>([])
  const currentAdId = ref<number | null>(null)
  const currentAdTitle = ref('')
  const editingStrategyId = ref<number | null>(null)
  const strategySubmitting = ref(false)

  const strategyForm = reactive({
    strategyType: '',
    strategyValue: '',
    status: 1
  })

  async function handleManageStrategy(item: any) {
    currentAdId.value = item.id
    currentAdTitle.value = item.title
    strategyModalVisible.value = true
    await fetchStrategies()
  }

  async function fetchStrategies() {
    if (!currentAdId.value) {
      return
    }
    strategyLoading.value = true
    try {
      const res = await getStrategiesByAdId(currentAdId.value)
      if (res.code === 200) {
        strategies.value = res.data || []
      }
    } catch (e: any) {
      console.error('获取策略列表失败:', e)
    } finally {
      strategyLoading.value = false
    }
  }

  function handleAddStrategy() {
    editingStrategyId.value = null
    Object.assign(strategyForm, {
      strategyType: '',
      strategyValue: '',
      status: 1
    })
    strategyFormVisible.value = true
  }

  function handleEditStrategy(strategy: any) {
    editingStrategyId.value = strategy.id
    Object.assign(strategyForm, {
      strategyType: strategy.strategyType,
      strategyValue: strategy.strategyValue,
      status: strategy.status
    })
    strategyFormVisible.value = true
  }

  async function handleSubmitStrategy() {
    try {
      strategySubmitting.value = true
      if (editingStrategyId.value && currentAdId.value) {
        await updateStrategy(editingStrategyId.value, {
          adId: currentAdId.value,
          ...strategyForm
        })
        ElMessage.success('更新成功')
      } else if (currentAdId.value) {
        await createStrategy({
          adId: currentAdId.value,
          ...strategyForm
        })
        ElMessage.success('创建成功')
      }
      strategyFormVisible.value = false
      await fetchStrategies()
    } catch (e: any) {
      ElMessage.error(e.message || '保存失败')
    } finally {
      strategySubmitting.value = false
    }
  }

  async function handleDeleteStrategy(strategy: any) {
    try {
      await ElMessageBox.confirm(`确定删除该策略？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteStrategy(strategy.id)
      ElMessage.success('删除成功')
      await fetchStrategies()
    } catch (e: any) {
      if (e !== 'cancel') {
        ElMessage.error(e.message || '删除失败')
      }
    }
  }

  function getStrategyTypeName(type: string) {
    const types: Record<string, string> = {
      time: '时间定向',
      region: '地区定向',
      device: '设备定向',
      user: '用户定向',
      frequency: '频次控制'
    }
    return types[type] || type
  }

  onMounted(() => {
    fetchList()
    fetchAdPositions()
  })
</script>

<style scoped>
  .ad-management {
    padding: 24px;
  }

  .search-card,
  .table-card {
    margin-bottom: 20px;
  }

  .subtitle {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }

  .link-text {
    color: var(--el-color-primary);
    text-decoration: none;
  }

  .link-text:hover {
    text-decoration: underline;
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .form-hint {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 5px;
  }

  .mb-3 {
    margin-bottom: 15px;
  }

  .strategy-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
