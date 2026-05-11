<template>
  <div class="ad-management">

    <div class="search-bar">
      <input 
        v-model="searchForm.positionCode" 
        type="text" 
        class="ctrl search-input" 
        placeholder="广告位编码"
        @keyup.enter="handleSearch"
      />
      <select v-model="searchForm.status" class="ctrl search-select" @change="handleSearch">
        <option value="">全部状态</option>
        <option value="1">启用</option>
        <option value="0">禁用</option>
      </select>
      <button class="btn btn-primary" @click="handleSearch">搜索</button>
      <button class="btn btn-secondary" @click="handleReset">重置</button>

      <button class="btn btn-primary btn-add" @click="handleAdd">
        <span class="btn-icon">+</span> 新增广告
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>广告位</th>
            <th>图片</th>
            <th>链接</th>
            <th>优先级</th>
            <th>排序</th>
            <th>状态</th>
            <th>展示/点击</th>
            <th>有效期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="11" class="loading-cell">加载中...</td>
          </tr>
          <tr v-else-if="list.length === 0">
            <td colspan="11" class="empty-cell">暂无数据</td>
          </tr>
          <tr v-else v-for="item in list" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              <div class="title-cell">
                <div>{{ item.title || '-' }}</div>
                <div v-if="item.subtitle" class="subtitle">{{ item.subtitle }}</div>
              </div>
            </td>
            <td>{{ item.positionCode || '-' }}</td>
            <td>
              <img v-if="item.imageUrl" :src="item.imageUrl" class="ad-thumb" alt="广告图" />
              <span v-else>-</span>
            </td>
            <td>
              <a v-if="item.linkValue" :href="item.linkValue" target="_blank" class="link-text">
                {{ truncateText(item.linkValue, 20) }}
              </a>
              <span v-else>-</span>
            </td>
            <td>{{ item.priority || 0 }}</td>
            <td>
              <span class="sort-badge">{{ item.sortOrder || 0 }}</span>
            </td>
            <td>
              <span :class="['status-tag', item.status === 1 ? 'status-normal' : 'status-disabled']">
                {{ item.status === 1 ? '启用' : '禁用' }}
              </span>
            </td>
            <td>
              <div class="stats-cell">
                <div>展示: {{ item.impressionCount || 0 }}</div>
                <div>点击: {{ item.clickCount || 0 }}</div>
              </div>
            </td>
            <td>
              <div class="time-cell">
                <div v-if="item.startTime">{{ formatDate(item.startTime) }}</div>
                <div v-if="item.endTime">至 {{ formatDate(item.endTime) }}</div>
              </div>
            </td>
            <td class="actions">
              <button class="btn btn-ghost btn-sm" @click="handleEdit(item)">编辑</button>
              <button class="btn btn-info btn-sm" @click="handleManageStrategy(item)">策略</button>
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
          <h3 class="modal-title">{{ editingId ? '编辑广告' : '新增广告' }}</h3>
          <button class="modal-close" @click="modalVisible = false">×</button>
        </div>
        <div class="modal-body">
          <form class="form" @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">广告位编码 *</label>
                <select v-model="form.positionCode" class="ctrl form-select" required>
                  <option value="">请选择广告位</option>
                  <option v-for="pos in adPositions" :key="pos.id" :value="pos.positionCode">
                    {{ pos.positionName }} ({{ pos.positionCode }})
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">标题 *</label>
                <input v-model="form.title" type="text" class="ctrl form-input" placeholder="广告标题" required />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">副标题</label>
              <input v-model="form.subtitle" type="text" class="ctrl form-input" placeholder="广告副标题" />
            </div>

            <div class="form-group">
              <label class="form-label">图片 URL *</label>
              <input v-model="form.imageUrl" type="text" class="ctrl form-input" placeholder="广告图片URL" required />
              <img v-if="form.imageUrl" :src="form.imageUrl" class="image-preview" alt="预览" />
            </div>

            <div class="form-group">
              <label class="form-label">视频 URL</label>
              <input v-model="form.videoUrl" type="text" class="ctrl form-input" placeholder="广告视频URL（视频类型时使用）" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">链接类型 *</label>
                <select v-model="form.linkType" class="ctrl form-select" required>
                  <option value="URL">外部链接</option>
                  <option value="ANIME">番剧详情</option>
                  <option value="SEARCH">搜索结果</option>
                  <option value="NONE">无跳转</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">链接值</label>
                <input v-model="form.linkValue" type="text" class="ctrl form-input" placeholder="URL地址/番剧ID/搜索关键词" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">开始时间 *</label>
                <input v-model="form.startTime" type="datetime-local" class="ctrl form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">结束时间 *</label>
                <input v-model="form.endTime" type="datetime-local" class="ctrl form-input" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">优先级</label>
                <input v-model.number="form.priority" type="number" class="ctrl form-input" placeholder="数字越大优先级越高" min="0" />
              </div>
              <div class="form-group">
                <label class="form-label">排序</label>
                <input v-model.number="form.sortOrder" type="number" class="ctrl form-input" placeholder="数字越小越靠前" min="0" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">目标用户类型</label>
                <select v-model="form.targetType" class="ctrl form-select">
                  <option value="ALL">全部用户</option>
                  <option value="NEW">新用户</option>
                  <option value="VIP">VIP用户</option>
                </select>
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

    <!-- 策略管理弹窗 -->
    <div v-if="strategyModalVisible" class="modal-overlay" @click.self="strategyModalVisible = false">
      <div class="modal modal-large">
        <div class="modal-header">
          <h3 class="modal-title">广告投放策略 - {{ currentAdTitle }}</h3>
          <button class="modal-close" @click="strategyModalVisible = false">×</button>
        </div>
        <div class="modal-body">
          <div class="strategy-header">
            <button class="btn btn-primary btn-sm" @click="handleAddStrategy">
              <span class="btn-icon">+</span> 新增策略
            </button>
          </div>
          
          <div class="strategy-list">
            <div v-if="strategyLoading" class="loading-text">加载中...</div>
            <div v-else-if="strategies.length === 0" class="empty-text">暂无策略</div>
            <div v-else class="strategy-items">
              <div v-for="strategy in strategies" :key="strategy.id" class="strategy-item">
                <div class="strategy-info">
                  <div class="strategy-type">
                    <span class="label">类型:</span>
                    <span class="value">{{ getStrategyTypeName(strategy.strategyType) }}</span>
                  </div>
                  <div class="strategy-value">
                    <span class="label">值:</span>
                    <span class="value">{{ strategy.strategyValue || '-' }}</span>
                  </div>
                  <div class="strategy-status">
                    <span :class="['status-tag', strategy.status === 1 ? 'status-normal' : 'status-disabled']">
                      {{ strategy.status === 1 ? '启用' : '禁用' }}
                    </span>
                  </div>
                </div>
                <div class="strategy-actions">
                  <button class="btn btn-ghost btn-sm" @click="handleEditStrategy(strategy)">编辑</button>
                  <button class="btn btn-danger btn-sm" @click="handleDeleteStrategy(strategy)">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 策略编辑弹窗 -->
    <div v-if="strategyFormVisible" class="modal-overlay" @click.self="strategyFormVisible = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingStrategyId ? '编辑策略' : '新增策略' }}</h3>
          <button class="modal-close" @click="strategyFormVisible = false">×</button>
        </div>
        <div class="modal-body">
          <form class="form" @submit.prevent="handleSubmitStrategy">
            <div class="form-group">
              <label class="form-label">策略类型 *</label>
              <select v-model="strategyForm.strategyType" class="ctrl form-select" required>
                <option value="">请选择</option>
                <option value="time">时间定向</option>
                <option value="region">地区定向</option>
                <option value="device">设备定向</option>
                <option value="user">用户定向</option>
                <option value="frequency">频次控制</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">策略值 *</label>
              <input v-model="strategyForm.strategyValue" type="text" class="ctrl form-input" placeholder="根据类型填写相应值" required />
              <small class="form-hint">
                时间: 如 "09:00-18:00" | 地区: 如 "北京,上海" | 设备: 如 "ios,android" | 用户: 如 "vip,new" | 频次: 如 "3/day"
              </small>
            </div>

            <div class="form-group">
              <label class="form-label">状态</label>
              <select v-model.number="strategyForm.status" class="ctrl form-select">
                <option :value="1">启用</option>
                <option :value="0">禁用</option>
              </select>
            </div>

            <div v-if="strategyErrorMsg" class="error-msg">{{ strategyErrorMsg }}</div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="strategyFormVisible = false">取消</button>
              <button type="submit" class="btn btn-primary" :disabled="strategySubmitting">
                {{ strategySubmitting ? '保存中...' : '保存' }}
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
import { getAdList, createAd, updateAd, deleteAd } from '@/api/advertisement.js'
import { getStrategiesByAdId, createStrategy, updateStrategy, deleteStrategy } from '@/api/adStrategy.js'
import { getActivePositions } from '@/api/adPosition.js'

const loading = ref(false)
const list = ref([])
const pagination = reactive({ current: 1, pageSize: 10, total: 0, pages: 1 })
const searchForm = reactive({ positionCode: '', status: '' })

// 广告位列表
const adPositions = ref([])

const modalVisible = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const errorMsg = ref('')

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
  } catch (e) {
    console.error('获取广告列表失败:', e)
    errorMsg.value = '获取列表失败'
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
  } catch (e) {
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
  errorMsg.value = ''
  modalVisible.value = true
}

function handleEdit(item) {
  editingId.value = item.id
  Object.assign(form, {
    id: item.id,
    positionCode: item.positionCode || '',
    title: item.title || '',
    subtitle: item.subtitle || '',
    imageUrl: item.imageUrl || '',
    videoUrl: item.videoUrl || '',
    htmlContent: item.htmlContent || '',
    linkType: item.linkType || 'URL',
    linkValue: item.linkValue || '',
    startTime: formatDateTimeLocal(item.startTime),
    endTime: formatDateTimeLocal(item.endTime),
    targetType: item.targetType || 'ALL',
    priority: item.priority || 0,
    status: item.status !== undefined ? item.status : 1,
    sortOrder: item.sortOrder || 0,
    extraData: item.extraData || ''
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
      priority: Number(form.priority) || 0,
      sortOrder: Number(form.sortOrder) || 0,
      status: Number(form.status)
    }
    
    // 移除空字符串字段
    Object.keys(payload).forEach(key => {
      if (payload[key] === '') {
        payload[key] = null
      }
    })
    
    if (editingId.value) {
      await updateAd(editingId.value, payload)
    } else {
      delete payload.id
      await createAd(payload)
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
    await updateAd(item.id, { ...item, status: newStatus })
    fetchList()
  } catch (e) {
    alert(e?.response?.data?.message || '操作失败')
  }
}

async function handleDelete(item) {
  if (!confirm(`确定删除广告 "${item.title}"？`)) return
  try {
    await deleteAd(item.id)
    fetchList()
  } catch (e) {
    alert(e?.response?.data?.message || '删除失败')
  }
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
}

function formatDateTimeLocal(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function truncateText(text, maxLength) {
  if (!text) return '-'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 策略管理相关
const strategyModalVisible = ref(false)
const strategyFormVisible = ref(false)
const strategyLoading = ref(false)
const strategySubmitting = ref(false)
const strategyErrorMsg = ref('')
const currentAdId = ref(null)
const currentAdTitle = ref('')
const editingStrategyId = ref(null)
const strategies = ref([])
const strategyForm = reactive({
  id: null,
  adId: null,
  strategyType: '',
  strategyValue: '',
  status: 1
})

async function handleManageStrategy(item) {
  currentAdId.value = item.id
  currentAdTitle.value = item.title
  strategyModalVisible.value = true
  await fetchStrategies()
}

async function fetchStrategies() {
  strategyLoading.value = true
  try {
    const res = await getStrategiesByAdId(currentAdId.value)
    if (res.code === 200) {
      strategies.value = res.data || []
    }
  } catch (e) {
    console.error('获取策略列表失败:', e)
  } finally {
    strategyLoading.value = false
  }
}

function handleAddStrategy() {
  editingStrategyId.value = null
  Object.assign(strategyForm, {
    id: null,
    adId: currentAdId.value,
    strategyType: '',
    strategyValue: '',
    status: 1
  })
  strategyErrorMsg.value = ''
  strategyFormVisible.value = true
}

function handleEditStrategy(strategy) {
  editingStrategyId.value = strategy.id
  Object.assign(strategyForm, {
    id: strategy.id,
    adId: strategy.adId,
    strategyType: strategy.strategyType || '',
    strategyValue: strategy.strategyValue || '',
    status: strategy.status !== undefined ? strategy.status : 1
  })
  strategyErrorMsg.value = ''
  strategyFormVisible.value = true
}

async function handleSubmitStrategy() {
  strategySubmitting.value = true
  strategyErrorMsg.value = ''
  try {
    const payload = {
      ...strategyForm,
      adId: currentAdId.value,
      status: Number(strategyForm.status)
    }
    
    if (editingStrategyId.value) {
      await updateStrategy(editingStrategyId.value, payload)
    } else {
      delete payload.id
      await createStrategy(payload)
    }
    strategyFormVisible.value = false
    await fetchStrategies()
  } catch (e) {
    strategyErrorMsg.value = e?.response?.data?.message || '操作失败'
  } finally {
    strategySubmitting.value = false
  }
}

async function handleDeleteStrategy(strategy) {
  if (!confirm(`确定删除该策略？`)) return
  try {
    await deleteStrategy(strategy.id)
    await fetchStrategies()
  } catch (e) {
    alert(e?.response?.data?.message || '删除失败')
  }
}

function getStrategyTypeName(type) {
  const typeMap = {
    time: '时间定向',
    region: '地区定向',
    device: '设备定向',
    user: '用户定向',
    frequency: '频次控制'
  }
  return typeMap[type] || type || '-'
}

onMounted(() => {
  fetchList()
  fetchAdPositions()
})
</script>

<style scoped>
.ad-management { padding: 32px; }              /* 加大内边距 */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;                 /* 加大底部间距 */
}

.page-title {
  font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
  font-size: 24px;                     /* 统一标题大小 */
  font-weight: 600;                    /* 统一字重 */
  color: var(--text);                  /* 主文字 #1d1d1f - 清晰可见 */
  margin: 0;
  letter-spacing: -0.2px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input { min-width: 150px; }
.search-select { min-width: 130px; }

.table-container {
  background: var(--card);             /* 白色背景 */
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.data-table { width: 100%; border-collapse: collapse; }
.data-table thead { background: var(--bg); }  /* 浅灰表头背景 */
.data-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--secondary);             /* 次要文字 #86868b */
  letter-spacing: -0.1px;
  border-bottom: 1px solid var(--border);
}
.data-table td {
  padding: 14px 16px;
  font-size: 15px;                     /* 统一字体大小 */
  color: var(--text);                  /* 主文字 #1d1d1f */
  border-bottom: 1px solid var(--border);
}
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: rgba(0, 0, 0, 0.02); }  /* 悬停效果 */
.loading-cell, .empty-cell { text-align: center; padding: 40px 16px; color: var(--secondary); }

.actions { display: flex; gap: 8px; }

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.subtitle {
  font-size: 12px;
  color: var(--secondary);             /* 次要文字 */
}

.ad-thumb {
  width: 80px;
  height: 45px;
  object-fit: cover;
  border-radius: 4px;
}

.link-text {
  color: #3b82f6;
  text-decoration: none;
}
.link-text:hover {
  text-decoration: underline;
}

.sort-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 8px;                  /* 8px 圆角 */
  font-size: 12px;
  font-weight: 500;
  background: rgba(0, 113, 227, 0.12); /* 苹果蓝背景 */
  color: var(--accent);                /* 苹果蓝文字 */
}

.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 8px;                  /* 8px 圆角 */
  font-size: 12px;
  font-weight: 500;
}
.status-normal { background: rgba(52, 199, 89, 0.12); color: var(--success); }   /* 成功绿 */
.status-disabled { background: rgba(255, 59, 48, 0.12); color: var(--danger); }  /* 危险红 */

.stats-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--secondary);             /* 次要文字 */
}

.time-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}
.page-info { font-size: 14px; color: var(--secondary); }  /* 次要文字 */
.page-size-select { padding: 8px 12px; font-size: 14px; }

/* 弹窗 - Apple 风格 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);      /* 弱化遮罩 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);         /* 毛玻璃效果 */
}
.modal {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 28px;                 /* 28px 圆角 */
  width: 90%;
  max-width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);  /* 柔和阴影 */
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;                  /* 加大内边距 */
  border-bottom: 1px solid var(--border);
}
.modal-title { 
  font-size: 20px; 
  font-weight: 600; 
  color: var(--text);                  /* 主文字 #1d1d1f */
  margin: 0;
  letter-spacing: -0.2px;
}
.modal-close {
  width: 32px; height: 32px;
  border: none; background: rgba(0, 0, 0, 0.06); color: var(--secondary);
  font-size: 20px; cursor: pointer; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.modal-close:hover { background: rgba(0, 0, 0, 0.1); color: var(--text); }
.modal-body { padding: 28px; }         /* 加大内边距 */

.form { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-label { font-size: 13px; font-weight: 500; color: var(--text); }
.form-input, .form-select { padding: 10px 14px; font-size: 14px; }

.image-preview {
  margin-top: 8px;
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
.error-msg {
  color: var(--danger);                /* 危险色 #ff3b30 */
  font-size: 13px;
  padding: 8px; 
  background: rgba(255, 59, 48, 0.12); 
  border-radius: 8px;
}
.btn-icon { font-size: 16px; margin-right: 4px; }

/* 策略管理样式 */
.modal-large {
  max-width: 900px;
}

.strategy-header {
  margin-bottom: 20px;
}

.strategy-list {
  min-height: 200px;
}

.loading-text, .empty-text {
  text-align: center;
  padding: 40px;
  color: var(--sub);
}

.strategy-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.strategy-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: all 0.2s;
}

.strategy-item:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(99,102,241,0.3);
}

.strategy-info {
  display: flex;
  gap: 24px;
  flex: 1;
}

.strategy-type, .strategy-value, .strategy-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.strategy-type .label,
.strategy-value .label {
  font-size: 13px;
  color: var(--sub);
  font-weight: 500;
}

.strategy-type .value,
.strategy-value .value {
  font-size: 14px;
  color: var(--text);
}

.strategy-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.form-hint {
  font-size: 12px;
  color: var(--sub);
  margin-top: 4px;
  line-height: 1.5;
}
</style>
