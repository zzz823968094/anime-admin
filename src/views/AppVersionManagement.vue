<template>
  <div class="app-version">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="平台">
          <el-select
            v-model="searchForm.platform"
            placeholder="全部平台"
            clearable
            style="width: 120px"
          >
            <el-option label="Android" value="android" />
            <el-option label="iOS" value="ios" />
            <el-option label="通用" value="all" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增版本
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="list" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="平台" width="100">
          <template #default="{ row }">
            <el-tag :type="getPlatformType(row.platform)" size="small">
              {{ platformLabel(row.platform) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="versionCode" label="版本号" width="100" />
        <el-table-column prop="versionName" label="版本名称" min-width="120" />
        <el-table-column label="强制更新" width="100">
          <template #default="{ row }">
            <el-tag :type="row.forceUpdate ? 'danger' : 'info'" size="small">
              {{ row.forceUpdate ? '强制' : '可选' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="文件大小" width="100">
          <template #default="{ row }">
            {{ formatSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              link
              :type="row.status === 'active' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '停用' : '启用' }}
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="modalVisible"
      :title="editingId ? '编辑版本' : '新增版本'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="平台" required>
          <el-select v-model="form.platform" style="width: 100%">
            <el-option label="Android" value="android" />
            <el-option label="iOS" value="ios" />
            <el-option label="通用" value="all" />
          </el-select>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="版本号" required>
              <el-input-number v-model="form.versionCode" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本名称" required>
              <el-input v-model="form.versionName" placeholder="如：1.0.0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="上传安装包" required>
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileUpload"
            :limit="1"
            accept=".apk,.ipa,.exe,.dmg"
            drag
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              点击或拖拽文件到此处上传
              <br />
              <small>支持 .apk, .ipa, .exe, .dmg</small>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item v-if="form.downloadUrl && !selectedFile" label="下载地址">
          <el-input v-model="form.downloadUrl" readonly />
        </el-form-item>

        <el-form-item label="更新说明">
          <el-input
            v-model="form.releaseNotes"
            type="textarea"
            :rows="4"
            placeholder="本次更新内容..."
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="强制更新">
              <el-switch v-model="form.forceUpdate" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="启用" value="active" />
                <el-option label="停用" value="inactive" />
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
  import { Plus, UploadFilled } from '@element-plus/icons-vue'
  import {
    getVersionList,
    createVersion,
    updateVersion,
    deleteVersion,
    uploadFile
  } from '@/api/appVersion'
  import type { AppVersion } from '@/types/api'

  const loading = ref(false)
  const list = ref<AppVersion[]>([])
  const pagination = reactive({ current: 1, pageSize: 10, total: 0 })
  const searchForm = reactive({ platform: '', status: '' })

  const modalVisible = ref(false)
  const editingId = ref<number | null>(null)
  const submitting = ref(false)
  const uploading = ref(false)
  const selectedFile = ref<File | null>(null)
  const uploadRef = ref()

  const form = reactive({
    platform: 'android',
    versionCode: 0,
    versionName: '',
    downloadUrl: '',
    fileSize: '',
    releaseNotes: '',
    forceUpdate: false,
    status: 'active'
  })

  async function fetchList() {
    loading.value = true
    try {
      const res = await getVersionList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        platform: searchForm.platform || undefined,
        status: searchForm.status || undefined
      })
      list.value = res.data.records || []
      pagination.total = res.data.total
    } catch (error: any) {
      ElMessage.error(error.message || '加载失败')
    } finally {
      loading.value = false
    }
  }

  function handleSearch() {
    pagination.current = 1
    fetchList()
  }

  function handleReset() {
    searchForm.platform = ''
    searchForm.status = ''
    handleSearch()
  }

  function handlePageChange(page: number) {
    pagination.current = page
    fetchList()
  }

  function handlePageSizeChange(size: number) {
    pagination.pageSize = size
    pagination.current = 1
    fetchList()
  }

  function handleAdd() {
    editingId.value = null
    Object.assign(form, {
      platform: 'android',
      versionCode: 0,
      versionName: '',
      downloadUrl: '',
      fileSize: '',
      releaseNotes: '',
      forceUpdate: false,
      status: 'active'
    })
    selectedFile.value = null
    modalVisible.value = true
  }

  function handleEdit(item: AppVersion) {
    editingId.value = item.id
    Object.assign(form, {
      platform: item.platform,
      versionCode: item.versionCode,
      versionName: item.versionName,
      downloadUrl: item.downloadUrl,
      fileSize: item.fileSize || '',
      releaseNotes: item.releaseNotes || '',
      forceUpdate: item.forceUpdate,
      status: item.status
    })
    selectedFile.value = null
    modalVisible.value = true
  }

  async function handleFileUpload(file: File) {
    // 验证文件类型
    const allowedTypes = ['.apk', '.ipa', '.exe', '.dmg']
    const fileName = file.name.toLowerCase()
    const isValidType = allowedTypes.some((type) => fileName.endsWith(type))

    if (!isValidType) {
      ElMessage.error('只支持上传 .apk, .ipa, .exe, .dmg 格式的文件')
      return
    }

    uploading.value = true

    try {
      const res = await uploadFile(file)
      form.downloadUrl = res.data.url
      form.fileSize = res.data.size
      selectedFile.value = file
      ElMessage.success('上传成功')
    } catch (e: any) {
      ElMessage.error(e.message || '文件上传失败')
    } finally {
      uploading.value = false
    }
  }

  async function handleSubmit() {
    if (!form.downloadUrl) {
      ElMessage.warning('请先上传文件')
      return
    }

    submitting.value = true
    try {
      const payload = { ...form, fileSize: form.fileSize || null }
      if (editingId.value) {
        await updateVersion(editingId.value, payload)
        ElMessage.success('更新成功')
      } else {
        await createVersion(payload)
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

  async function handleToggleStatus(item: AppVersion) {
    try {
      await updateVersion(item.id, { status: item.status === 'active' ? 'inactive' : 'active' })
      ElMessage.success('状态更新成功')
      fetchList()
    } catch (e: any) {
      ElMessage.error(e.message || '操作失败')
    }
  }

  async function handleDelete(item: AppVersion) {
    try {
      await ElMessageBox.confirm(
        `确定删除版本 ${item.versionName}（${platformLabel(item.platform)}）？`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      await deleteVersion(item.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (e: any) {
      if (e !== 'cancel') {
        ElMessage.error(e.message || '删除失败')
      }
    }
  }

  function platformLabel(p: string) {
    return { android: 'Android', ios: 'iOS', all: '通用' }[p] || p
  }

  function getPlatformType(platform: string) {
    const typeMap: Record<string, 'success' | 'warning' | 'info'> = {
      android: 'success',
      ios: 'warning',
      all: 'info'
    }
    return typeMap[platform] || 'info'
  }

  function formatSize(bytes?: string | number) {
    if (!bytes) {
      return '-'
    }
    const numBytes = typeof bytes === 'string' ? parseInt(bytes) : bytes
    if (numBytes < 1024) {
      return numBytes + ' B'
    }
    if (numBytes < 1024 * 1024) {
      return (numBytes / 1024).toFixed(1) + ' KB'
    }
    return (numBytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  function formatDate(d?: string) {
    if (!d) {
      return '-'
    }
    return new Date(d).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  }

  onMounted(fetchList)
</script>

<style scoped>
  .app-version {
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

  :deep(.el-upload-dragger) {
    padding: 40px;
  }

  .upload-hint {
    color: var(--secondary);
    font-size: 14px;
  }
</style>
