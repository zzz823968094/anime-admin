<template>
  <div class="ad-position-management">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
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
            新增广告位
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="list" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="广告位编码" min-width="150">
          <template #default="{ row }">
            <code class="code-text">{{ row.positionCode }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="positionName" label="广告位名称" min-width="120">
          <template #default="{ row }">
            {{ row.positionName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150">
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="显示类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getDisplayTypeName(row.displayType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="尺寸" width="120">
          <template #default="{ row }">
            <span v-if="row.width && row.height">{{ row.width }} × {{ row.height }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="maxCount" label="最大数量" width="100">
          <template #default="{ row }">
            {{ row.maxCount || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="排序" width="80">
          <template #default="{ row }">
            <el-tag size="small">{{ row.sortOrder || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
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
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="modalVisible"
      :title="editingId ? '编辑广告位' : '新增广告位'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="广告位编码" required>
              <el-input v-model="form.positionCode" placeholder="如: home_banner" />
              <div class="form-hint">唯一标识，用于关联广告</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="广告位名称" required>
              <el-input v-model="form.positionName" placeholder="如: 首页横幅" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="广告位描述" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="显示类型">
              <el-select v-model="form.displayType" style="width: 100%">
                <el-option label="图片" value="IMAGE" />
                <el-option label="视频" value="VIDEO" />
                <el-option label="富媒体" value="HTML" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="宽度 (px)">
              <el-input-number
                v-model="form.width"
                :min="0"
                style="width: 100%"
                placeholder="可选"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="高度 (px)">
              <el-input-number
                v-model="form.height"
                :min="0"
                style="width: 100%"
                placeholder="可选"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最大广告数">
              <el-input-number
                v-model="form.maxCount"
                :min="1"
                style="width: 100%"
                placeholder="该位置最多展示的广告数"
              />
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
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import { getAllPositions, createPosition, updatePosition, deletePosition } from '@/api/adPosition'
  import type { AdPosition } from '@/types/api'

  const loading = ref(false)
  const list = ref<AdPosition[]>([])
  const searchForm = reactive({ status: '' })

  const modalVisible = ref(false)
  const editingId = ref<number | null>(null)
  const submitting = ref(false)

  const form = reactive({
    id: null as number | null,
    positionCode: '',
    positionName: '',
    description: '',
    displayType: 'IMAGE',
    width: null as number | null,
    height: null as number | null,
    maxCount: 1,
    status: 1,
    sortOrder: 0
  })

  async function fetchList() {
    loading.value = true
    try {
      const res = await getAllPositions()
      let data = res.data || []
      // 前端过滤状态
      if (searchForm.status !== '') {
        const statusNum = parseInt(searchForm.status)
        data = data.filter((item: AdPosition) => item.status === statusNum)
      }
      list.value = data
    } catch (error: any) {
      ElMessage.error(error.message || '获取列表失败')
    } finally {
      loading.value = false
    }
  }

  function handleSearch() {
    fetchList()
  }

  function handleReset() {
    searchForm.status = ''
    fetchList()
  }

  function handleAdd() {
    editingId.value = null
    Object.assign(form, {
      id: null,
      positionCode: '',
      positionName: '',
      description: '',
      displayType: 'IMAGE',
      width: null,
      height: null,
      maxCount: 1,
      status: 1,
      sortOrder: 0
    })
    modalVisible.value = true
  }

  function handleEdit(item: AdPosition) {
    editingId.value = item.id
    Object.assign(form, {
      id: item.id,
      positionCode: item.positionCode || '',
      positionName: item.positionName || '',
      description: item.description || '',
      displayType: item.displayType || 'IMAGE',
      width: item.width,
      height: item.height,
      maxCount: item.maxCount !== null ? item.maxCount : 1,
      status: item.status !== undefined ? item.status : 1,
      sortOrder: item.sortOrder || 0
    })
    modalVisible.value = true
  }

  async function handleSubmit() {
    submitting.value = true
    try {
      const payload = {
        ...form,
        sortOrder: Number(form.sortOrder) || 0,
        status: Number(form.status)
      }

      // 移除空字符串和null字段
      Object.keys(payload).forEach((key) => {
        if (payload[key] === '' || payload[key] === null) {
          delete payload[key]
        }
      })

      if (editingId.value) {
        await updatePosition(editingId.value, payload)
        ElMessage.success('更新成功')
      } else {
        delete payload.id
        await createPosition(payload)
        ElMessage.success('创建成功')
      }
      modalVisible.value = false
      fetchList()
    } catch (e: any) {
      ElMessage.error(e.message || '操作失败')
    } finally {
      submitting.value = false
    }
  }

  async function handleToggleStatus(item: AdPosition) {
    try {
      const newStatus = item.status === 1 ? 0 : 1
      await updatePosition(item.id, { ...item, status: newStatus })
      ElMessage.success('状态更新成功')
      fetchList()
    } catch (e: any) {
      ElMessage.error(e.message || '操作失败')
    }
  }

  async function handleDelete(item: AdPosition) {
    try {
      await ElMessageBox.confirm(`确定删除广告位 "${item.positionName}"？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deletePosition(item.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (e: any) {
      if (e !== 'cancel') {
        ElMessage.error(e.message || '删除失败')
      }
    }
  }

  function getDisplayTypeName(type?: string) {
    const typeMap: Record<string, string> = {
      IMAGE: '图片',
      VIDEO: '视频',
      HTML: '富媒体'
    }
    return typeMap[type || ''] || type || '-'
  }

  onMounted(fetchList)
</script>

<style scoped>
  .ad-position-management {
    padding: 24px;
  }

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    margin-bottom: 20px;
  }

  .code-text {
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: var(--el-color-primary);
  }

  .form-hint {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }
  .data-table td {
    padding: 14px 16px;
    font-size: 15px; /* 统一字体大小 */
    color: var(--text); /* 主文字 #1d1d1f */
    border-bottom: 1px solid var(--border);
  }
  .data-table tbody tr:last-child td {
    border-bottom: none;
  }
  .data-table tbody tr:hover {
    background: rgba(0, 0, 0, 0.02);
  } /* 悬停效果 */

  .code-text {
    background: rgba(99, 102, 241, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #a78bfa;
  }
  .form-hint {
    font-size: 12px;
    color: var(--secondary); /* 次要文字 */
    margin-top: 4px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
  }
  .error-msg {
    color: var(--danger); /* 危险色 #ff3b30 */
    font-size: 13px;
    padding: 8px;
    background: rgba(255, 59, 48, 0.12);
    border-radius: 8px;
  }
  .btn-icon {
    font-size: 16px;
    margin-right: 4px;
  }
</style>
