<template>
  <div class="ad-position-management">
    <div class="page-header">
      <h2 class="page-title">广告位管理</h2>
      <button class="btn btn-primary" @click="handleAdd">
        <span class="btn-icon">+</span> 新增广告位
      </button>
    </div>

    <div class="search-bar">
      <select v-model="searchForm.status" class="ctrl search-select" @change="handleSearch">
        <option value="">全部状态</option>
        <option value="1">启用</option>
        <option value="0">禁用</option>
      </select>
      <button class="btn btn-primary" @click="handleSearch">搜索</button>
      <button class="btn btn-secondary" @click="handleReset">重置</button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>广告位编码</th>
            <th>广告位名称</th>
            <th>描述</th>
            <th>显示类型</th>
            <th>尺寸</th>
            <th>最大数量</th>
            <th>排序</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="10" class="loading-cell">加载中...</td>
          </tr>
          <tr v-else-if="list.length === 0">
            <td colspan="10" class="empty-cell">暂无数据</td>
          </tr>
          <tr v-else v-for="item in list" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              <code class="code-text">{{ item.positionCode }}</code>
            </td>
            <td>{{ item.positionName || '-' }}</td>
            <td>{{ item.description || '-' }}</td>
            <td>
              <span class="type-tag">{{ getDisplayTypeName(item.displayType) }}</span>
            </td>
            <td>
              <span v-if="item.width && item.height">{{ item.width }} × {{ item.height }}</span>
              <span v-else>-</span>
            </td>
            <td>{{ item.maxCount || '-' }}</td>
            <td>
              <span class="sort-badge">{{ item.sortOrder || 0 }}</span>
            </td>
            <td>
              <span :class="['status-tag', item.status === 1 ? 'status-normal' : 'status-disabled']">
                {{ item.status === 1 ? '启用' : '禁用' }}
              </span>
            </td>
            <td class="actions">
              <button class="btn btn-ghost btn-sm" @click="handleEdit(item)">编辑</button>
              <button
                class="btn btn-sm"
                :class="item.status === 1 ? 'btn-warning' : 'btn-success'"
                @click="handleToggleStatus(item)"
              >{{ item.status === 1 ? '禁用' : '启用' }}</button>
              <button class="btn btn-danger btn-sm" @click="handleDelete(item)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="modalVisible" class="modal-overlay" @click.self="modalVisible = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingId ? '编辑广告位' : '新增广告位' }}</h3>
          <button class="modal-close" @click="modalVisible = false">×</button>
        </div>
        <div class="modal-body">
          <form class="form" @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">广告位编码 *</label>
                <input v-model="form.positionCode" type="text" class="ctrl form-input" placeholder="如: home_banner" required />
                <small class="form-hint">唯一标识，用于关联广告</small>
              </div>
              <div class="form-group">
                <label class="form-label">广告位名称 *</label>
                <input v-model="form.positionName" type="text" class="ctrl form-input" placeholder="如: 首页横幅" required />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea v-model="form.description" class="ctrl form-textarea" placeholder="广告位描述" rows="3"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">显示类型</label>
                <select v-model="form.displayType" class="ctrl form-select">
                  <option value="IMAGE">图片</option>
                  <option value="VIDEO">视频</option>
                  <option value="HTML">富媒体</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">排序</label>
                <input v-model.number="form.sortOrder" type="number" class="ctrl form-input" placeholder="数字越小越靠前" min="0" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">宽度 (px)</label>
                <input v-model.number="form.width" type="number" class="ctrl form-input" placeholder="可选" min="0" />
              </div>
              <div class="form-group">
                <label class="form-label">高度 (px)</label>
                <input v-model.number="form.height" type="number" class="ctrl form-input" placeholder="可选" min="0" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">最大广告数</label>
                <input v-model.number="form.maxCount" type="number" class="ctrl form-input" placeholder="该位置最多展示的广告数" min="1" />
              </div>
              <div class="form-group">
                <label class="form-label">状态</label>
                <select v-model.number="form.status" class="ctrl form-select">
                  <option :value="1">启用</option>
                  <option :value="0">禁用</option>
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
import { getAllPositions, createPosition, updatePosition, deletePosition } from '@/api/adPosition.js'

const loading = ref(false)
const list = ref([])
const searchForm = reactive({ status: '' })

const modalVisible = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const errorMsg = ref('')

const form = reactive({
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

async function fetchList() {
  loading.value = true
  try {
    const res = await getAllPositions()
    if (res.code === 200) {
      let data = res.data || []
      // 前端过滤状态
      if (searchForm.status !== '') {
        const statusNum = parseInt(searchForm.status)
        data = data.filter(item => item.status === statusNum)
      }
      list.value = data
    }
  } catch (e) {
    console.error('获取广告位列表失败:', e)
    errorMsg.value = '获取列表失败'
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
  errorMsg.value = ''
  modalVisible.value = true
}

function handleEdit(item) {
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
  errorMsg.value = ''
  modalVisible.value = true
}

async function handleSubmit() {
  submitting.value = true
  errorMsg.value = ''
  try {
    const payload = { 
      ...form,
      sortOrder: Number(form.sortOrder) || 0,
      status: Number(form.status)
    }
    
    // 移除空字符串和null字段
    Object.keys(payload).forEach(key => {
      if (payload[key] === '' || payload[key] === null) {
        delete payload[key]
      }
    })
    
    if (editingId.value) {
      await updatePosition(editingId.value, payload)
    } else {
      delete payload.id
      await createPosition(payload)
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
    const newStatus = item.status === 1 ? 0 : 1
    await updatePosition(item.id, { ...item, status: newStatus })
    fetchList()
  } catch (e) {
    alert(e?.response?.data?.message || '操作失败')
  }
}

async function handleDelete(item) {
  if (!confirm(`确定删除广告位 "${item.positionName}"？`)) return
  try {
    await deletePosition(item.id)
    fetchList()
  } catch (e) {
    alert(e?.response?.data?.message || '删除失败')
  }
}

function getDisplayTypeName(type) {
  const typeMap = {
    IMAGE: '图片',
    VIDEO: '视频',
    HTML: '富媒体'
  }
  return typeMap[type] || type || '-'
}

onMounted(fetchList)
</script>

<style scoped>
.ad-position-management { padding: 24px; }

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

.code-text {
  background: rgba(99,102,241,0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #a78bfa;
}

.type-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(59,130,246,0.15);
  color: #3b82f6;
}

.sort-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(99,102,241,0.15);
  color: #a78bfa;
}

.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-normal { background: rgba(34,197,94,0.1); color: #22c55e; }
.status-disabled { background: rgba(239,68,68,0.1); color: #ef4444; }

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
  max-width: 640px;
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
  font-family: inherit;
}
.form-hint {
  font-size: 12px;
  color: var(--sub);
  margin-top: 4px;
}

.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
.error-msg {
  color: #f87171; font-size: 13px;
  padding: 8px; background: rgba(248,113,113,0.1); border-radius: 8px;
}
.btn-icon { font-size: 16px; margin-right: 4px; }
</style>
