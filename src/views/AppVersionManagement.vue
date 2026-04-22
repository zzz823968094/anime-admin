<template>
  <div class="app-version">
    <div class="page-header">
      <h2 class="page-title">App 版本管理</h2>
      <button class="btn btn-primary" @click="handleAdd">
        <span class="btn-icon">+</span> 新增版本
      </button>
    </div>

    <div class="search-bar">
      <select v-model="searchForm.platform" class="ctrl search-select" @change="handleSearch">
        <option value="">全部平台</option>
        <option value="android">Android</option>
        <option value="ios">iOS</option>
        <option value="all">通用</option>
      </select>
      <select v-model="searchForm.status" class="ctrl search-select" @change="handleSearch">
        <option value="">全部状态</option>
        <option value="active">启用</option>
        <option value="inactive">停用</option>
      </select>
      <button class="btn btn-primary" @click="handleSearch">搜索</button>
      <button class="btn btn-secondary" @click="handleReset">重置</button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>平台</th>
            <th>版本号</th>
            <th>版本名称</th>
            <th>强制更新</th>
            <th>文件大小</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="loading-cell">加载中...</td>
          </tr>
          <tr v-else-if="list.length === 0">
            <td colspan="9" class="empty-cell">暂无数据</td>
          </tr>
          <tr v-else v-for="item in list" :key="item.id">
            <td>{{ item.id }}</td>
            <td><span :class="['platform-tag', `platform-${item.platform}`]">{{ platformLabel(item.platform) }}</span></td>
            <td>{{ item.versionCode }}</td>
            <td>{{ item.versionName }}</td>
            <td>
              <span :class="['force-tag', item.forceUpdate ? 'force-yes' : 'force-no']">
                {{ item.forceUpdate ? '强制' : '可选' }}
              </span>
            </td>
            <td>{{ formatSize(item.fileSize) }}</td>
            <td>
              <span :class="['status-tag', item.status === 'active' ? 'status-normal' : 'status-disabled']">
                {{ item.status === 'active' ? '启用' : '停用' }}
              </span>
            </td>
            <td>{{ formatDate(item.createTime) }}</td>
            <td class="actions">
              <button class="btn btn-ghost btn-sm" @click="handleEdit(item)">编辑</button>
              <button
                class="btn btn-sm"
                :class="item.status === 'active' ? 'btn-warning' : 'btn-success'"
                @click="handleToggleStatus(item)"
              >{{ item.status === 'active' ? '停用' : '启用' }}</button>
              <button class="btn btn-danger btn-sm" @click="handleDelete(item)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination.total > 0" class="pagination">
      <button class="btn btn-sm" :disabled="pagination.current === 1" @click="handlePageChange(pagination.current - 1)">上一页</button>
      <span class="page-info">第 {{ pagination.current }} / {{ pagination.pages }} 页，共 {{ pagination.total }} 条</span>
      <button class="btn btn-sm" :disabled="pagination.current === pagination.pages" @click="handlePageChange(pagination.current + 1)">下一页</button>
      <select class="ctrl page-size-select" v-model.number="pagination.pageSize" @change="handlePageSizeChange">
        <option :value="10">10条/页</option>
        <option :value="20">20条/页</option>
        <option :value="50">50条/页</option>
      </select>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="modalVisible" class="modal-overlay" @click.self="modalVisible = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingId ? '编辑版本' : '新增版本' }}</h3>
          <button class="modal-close" @click="modalVisible = false">×</button>
        </div>
        <div class="modal-body">
          <form class="form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label class="form-label">平台 *</label>
              <select v-model="form.platform" class="ctrl form-select" required>
                <option value="android">Android</option>
                <option value="ios">iOS</option>
                <option value="all">通用</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">版本号（整数）*</label>
                <input v-model.number="form.versionCode" type="number" class="ctrl form-input" placeholder="如：100" required min="1" />
              </div>
              <div class="form-group">
                <label class="form-label">版本名称 *</label>
                <input v-model="form.versionName" type="text" class="ctrl form-input" placeholder="如：1.0.0" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">上传安装包 *</label>
              <div class="upload-area">
                <input 
                  type="file" 
                  ref="fileInput"
                  @change="handleFileUpload" 
                  accept=".apk,.ipa,.exe,.dmg"
                  class="file-input"
                  :disabled="uploading"
                />
                <div v-if="uploading" class="upload-status uploading">
                  <span class="upload-icon">⏳</span>
                  <span>上传中...</span>
                </div>
                <div v-else-if="selectedFile" class="upload-status success">
                  <span class="upload-icon">✓</span>
                  <span>{{ selectedFile.name }}</span>
                  <span class="file-size">({{ formatSize(selectedFile.size) }})</span>
                </div>
                <div v-else class="upload-hint">
                  点击选择文件或拖拽文件到此处（支持 .apk, .ipa, .exe, .dmg）
                </div>
              </div>
            </div>
            <div v-if="form.downloadUrl && !selectedFile" class="form-group">
              <label class="form-label">下载地址</label>
              <input v-model="form.downloadUrl" type="text" class="ctrl form-input" readonly />
            </div>
            <div class="form-group">
              <label class="form-label">更新说明</label>
              <textarea v-model="form.releaseNotes" class="ctrl form-textarea" rows="4" placeholder="本次更新内容..."></textarea>
            </div>
            <div class="form-row">
              <div class="form-group form-check">
                <label class="check-label">
                  <input v-model="form.forceUpdate" type="checkbox" class="check-input" />
                  <span>强制更新</span>
                </label>
              </div>
              <div class="form-group">
                <label class="form-label">状态</label>
                <select v-model="form.status" class="ctrl form-select">
                  <option value="active">启用</option>
                  <option value="inactive">停用</option>
                </select>
              </div>
            </div>
            <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="modalVisible = false">取消</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getVersionList, createVersion, updateVersion, deleteVersion, uploadFile } from '@/api/appVersion.js'

const loading = ref(false)
const list = ref([])
const pagination = reactive({ current: 1, pageSize: 10, total: 0, pages: 1 })
const searchForm = reactive({ platform: '', status: '' })

const modalVisible = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const uploading = ref(false)
const errorMsg = ref('')
const selectedFile = ref(null)
const form = reactive({
  platform: 'android',
  versionCode: '',
  versionName: '',
  downloadUrl: '',
  fileSize: '',
  releaseNotes: '',
  forceUpdate: false,
  status: 'active',
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getVersionList({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      platform: searchForm.platform || undefined,
      status: searchForm.status || undefined,
    })
    if (res.code === 200) {
      list.value = res.data.records
      pagination.total = res.data.total
      pagination.pages = res.data.pages
    }
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

function handlePageChange(page) {
  pagination.current = page
  fetchList()
}

function handlePageSizeChange() {
  pagination.current = 1
  fetchList()
}

function handleAdd() {
  editingId.value = null
  Object.assign(form, { platform: 'android', versionCode: '', versionName: '', downloadUrl: '', fileSize: '', releaseNotes: '', forceUpdate: false, status: 'active' })
  selectedFile.value = null
  errorMsg.value = ''
  modalVisible.value = true
}

function handleEdit(item) {
  editingId.value = item.id
  Object.assign(form, {
    platform: item.platform,
    versionCode: item.versionCode,
    versionName: item.versionName,
    downloadUrl: item.downloadUrl,
    fileSize: item.fileSize || '',
    releaseNotes: item.releaseNotes || '',
    forceUpdate: item.forceUpdate,
    status: item.status,
  })
  selectedFile.value = null
  errorMsg.value = ''
  modalVisible.value = true
}

async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  const allowedTypes = ['.apk', '.ipa', '.exe', '.dmg']
  const fileName = file.name.toLowerCase()
  const isValidType = allowedTypes.some(type => fileName.endsWith(type))
  
  if (!isValidType) {
    errorMsg.value = '只支持上传 .apk, .ipa, .exe, .dmg 格式的文件'
    return
  }

  uploading.value = true
  errorMsg.value = ''
  
  try {
    const res = await uploadFile(file)
    if (res.code === 200) {
      form.downloadUrl = res.data.url
      form.fileSize = res.data.size
      selectedFile.value = file
      errorMsg.value = ''
    }
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || '文件上传失败'
  } finally {
    uploading.value = false
  }
}

async function handleSubmit() {
  if (!form.downloadUrl) {
    errorMsg.value = '请先上传文件'
    return
  }
  
  submitting.value = true
  errorMsg.value = ''
  try {
    const payload = { ...form, fileSize: form.fileSize || null }
    if (editingId.value) {
      await updateVersion(editingId.value, payload)
    } else {
      await createVersion(payload)
    }
    modalVisible.value = false
    fetchList()
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || '操作失败'
  } finally {
    submitting.value = false
  }
}

async function handleToggleStatus(item) {
  try {
    await updateVersion(item.id, { status: item.status === 'active' ? 'inactive' : 'active' })
    fetchList()
  } catch (e) {
    alert(e?.response?.data?.message || '操作失败')
  }
}

async function handleDelete(item) {
  if (!confirm(`确定删除版本 ${item.versionName}（${item.platform}）？`)) return
  try {
    await deleteVersion(item.id)
    fetchList()
  } catch (e) {
    alert(e?.response?.data?.message || '删除失败')
  }
}

function platformLabel(p) {
  return { android: 'Android', ios: 'iOS', all: '通用' }[p] || p
}

function formatSize(bytes) {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
}

onMounted(fetchList)
</script>

<style scoped>
.app-version { padding: 24px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-select { min-width: 130px; }

.table-container {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.data-table { width: 100%; border-collapse: collapse; }
.data-table thead { background: rgba(255,255,255,0.05); }
.data-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--sub);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border);
}
.data-table td {
  padding: 14px 16px;
  font-size: 14px;
  color: var(--text);
  border-bottom: 1px solid var(--border);
}
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: rgba(255,255,255,0.02); }
.loading-cell, .empty-cell { text-align: center; padding: 40px 16px; color: var(--sub); }

.actions { display: flex; gap: 8px; }

.platform-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}
.platform-android { background: rgba(61,220,132,0.15); color: #3ddc84; }
.platform-ios { background: rgba(147,197,253,0.15); color: #93c5fd; }
.platform-all { background: rgba(167,139,250,0.15); color: #a78bfa; }

.force-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}
.force-yes { background: rgba(251,113,133,0.15); color: #fb7185; }
.force-no { background: rgba(148,163,184,0.1); color: #94a3b8; }

.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-normal { background: rgba(34,197,94,0.1); color: #22c55e; }
.status-disabled { background: rgba(239,68,68,0.1); color: #ef4444; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}
.page-info { font-size: 14px; color: var(--sub); }
.page-size-select { padding: 8px 12px; font-size: 14px; }

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  width: 90%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}
.modal-title { font-size: 18px; font-weight: 600; color: #fff; margin: 0; }
.modal-close {
  width: 32px; height: 32px;
  border: none; background: transparent; color: var(--sub);
  font-size: 24px; cursor: pointer; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
.modal-body { padding: 24px; }

.form { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-label { font-size: 13px; font-weight: 500; color: var(--text); }
.form-input, .form-select { padding: 10px 14px; font-size: 14px; }
.form-textarea {
  padding: 10px 14px;
  font-size: 14px;
  resize: vertical;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-family: inherit;
}
.form-textarea:focus { outline: none; border-color: var(--primary); }

.form-check { justify-content: flex-end; }
.check-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: var(--text); }
.check-input { width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary); }

.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
.error-msg {
  color: #f87171; font-size: 13px;
  padding: 8px; background: rgba(248,113,113,0.1); border-radius: 8px;
}
.btn-icon { font-size: 16px; margin-right: 4px; }

/* 文件上传区域 */
.upload-area {
  position: relative;
  border: 2px dashed var(--border);
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s;
  background: rgba(255,255,255,0.02);
}
.upload-area:hover {
  border-color: var(--primary);
  background: rgba(99,102,241,0.05);
}
.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}
.upload-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text);
}
.upload-status.uploading {
  color: #fbbf24;
}
.upload-status.success {
  color: #22c55e;
}
.upload-icon {
  font-size: 20px;
}
.file-size {
  font-size: 12px;
  color: var(--sub);
  margin-left: 4px;
}
.upload-hint {
  color: var(--sub);
  font-size: 14px;
}
</style>
