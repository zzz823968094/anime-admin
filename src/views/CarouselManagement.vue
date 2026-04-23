<template>
  <div class="carousel-management">
    <div class="page-header">
      <h2 class="page-title">轮播图管理</h2>
      <button class="btn btn-primary" @click="handleAdd">
        <span class="btn-icon">+</span> 新增轮播图
      </button>
    </div>

    <div class="search-bar">
      <select v-model="searchForm.type" class="ctrl search-select" @change="handleSearch">
        <option value="">全部类型</option>
        <option value="video">视频</option>
        <option value="ad">广告</option>
      </select>
      <select v-model="searchForm.status" class="ctrl search-select" @change="handleSearch">
        <option value="">全部状态</option>
        <option value="enabled">启用</option>
        <option value="disabled">禁用</option>
      </select>
      <button class="btn btn-primary" @click="handleSearch">搜索</button>
      <button class="btn btn-secondary" @click="handleReset">重置</button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>排序</th>
            <th>视频ID</th>
            <th>类型</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>修改时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="loading-cell">加载中...</td>
          </tr>
          <tr v-else-if="list.length === 0">
            <td colspan="8" class="empty-cell">暂无数据</td>
          </tr>
          <tr v-else v-for="item in list" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              <span class="sort-badge">{{ item.sortOrder }}</span>
            </td>
            <td>
              <div v-if="item.videoName" class="video-info-cell">
                <img :src="item.videoCover" class="video-thumb" alt="封面" />
                <span>{{ item.videoName }}</span>
              </div>
              <span v-else>-</span>
            </td>
            <td>
              <span :class="['type-tag', item.type === 'video' ? 'type-video' : 'type-ad']">
                {{ item.type === 'video' ? '视频' : '广告' }}
              </span>
            </td>
            <td>
              <span :class="['status-tag', item.status === 'enabled' ? 'status-normal' : 'status-disabled']">
                {{ item.status === 'enabled' ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ formatDate(item.createTime) }}</td>
            <td>{{ formatDate(item.updateTime) }}</td>
            <td class="actions">
              <button class="btn btn-ghost btn-sm" @click="handleEdit(item)">编辑</button>
              <button
                class="btn btn-sm"
                :class="item.status === 'enabled' ? 'btn-warning' : 'btn-success'"
                @click="handleToggleStatus(item)"
              >{{ item.status === 'enabled' ? '禁用' : '启用' }}</button>
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
          <h3 class="modal-title">{{ editingId ? '编辑轮播图' : '新增轮播图' }}</h3>
          <button class="modal-close" @click="modalVisible = false">×</button>
        </div>
        <div class="modal-body">
          <form class="form" @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">排序 *</label>
                <input v-model.number="form.sortOrder" type="number" class="ctrl form-input" placeholder="数字越小越靠前" required min="0" />
              </div>
              <div class="form-group">
                <label class="form-label">类型 *</label>
                <select v-model="form.type" class="ctrl form-select" required>
                  <option value="video">视频</option>
                  <option value="ad">广告</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">视频（可选）</label>
              <!-- 已选择的视频显示 -->
              <div v-if="selectedAnime" class="selected-anime">
                <img :src="selectedAnime.vodPic" class="anime-cover" alt="封面" />
                <div class="anime-info">
                  <div class="anime-name">{{ selectedAnime.vodName }}</div>
                  <button type="button" class="btn-clear" @click="clearSelectedAnime">×</button>
                </div>
              </div>
              
              <!-- 搜索框 -->
              <div v-else class="anime-search-box">
                <div class="search-input-group">
                  <input 
                    v-model="animeSearchKeyword" 
                    type="text" 
                    class="ctrl form-input" 
                    placeholder="输入番剧名称搜索"
                    @keyup.enter="searchAnime"
                  />
                  <button type="button" class="btn btn-primary btn-search" @click="searchAnime" :disabled="isSearching">
                    {{ isSearching ? '搜索中...' : '搜索' }}
                  </button>
                </div>
                
                <!-- 搜索结果下拉 -->
                <div v-if="animeSearchResults.length > 0" class="search-results">
                  <div 
                    v-for="anime in animeSearchResults" 
                    :key="anime.id" 
                    class="search-result-item"
                    @click="selectAnime(anime)"
                  >
                    <img :src="anime.vodPic" class="result-cover" alt="封面" />
                    <span class="result-name">{{ anime.vodName }}</span>
                  </div>
                </div>
                <div v-if="isSearching" class="search-loading">搜索中...</div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">状态</label>
              <select v-model="form.status" class="ctrl form-select">
                <option value="enabled">启用</option>
                <option value="disabled">禁用</option>
              </select>
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
import { getCarouselList, createCarousel, updateCarousel, deleteCarousel, enableCarousel, disableCarousel } from '@/api/carousel.js'
import { getAnimeList } from '@/utils/api.js'

const loading = ref(false)
const list = ref([])
const pagination = reactive({ current: 1, pageSize: 10, total: 0, pages: 1 })
const searchForm = reactive({ type: '', status: '' })

const modalVisible = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const errorMsg = ref('')

// 视频搜索相关
const animeSearchKeyword = ref('')
const animeSearchResults = ref([])
const isSearching = ref(false)
const selectedAnime = ref(null)
const form = reactive({
  sortOrder: 0,
  videoId: '',
  videoName: '',
  videoCover: '',
  type: 'video',
  status: 'enabled',
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getCarouselList({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      type: searchForm.type || undefined,
      status: searchForm.status || undefined,
    })
    console.log(res)
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
  searchForm.type = ''
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
    sortOrder: 0, 
    videoId: '', 
    videoName: '',
    videoCover: '',
    type: 'video', 
    status: 'enabled' 
  })
  selectedAnime.value = null
  animeSearchKeyword.value = ''
  animeSearchResults.value = []
  errorMsg.value = ''
  modalVisible.value = true
}

function handleEdit(item) {
  editingId.value = item.id
  Object.assign(form, {
    sortOrder: item.sortOrder,
    videoId: item.videoId || '',
    videoName: item.videoName || '',
    videoCover: item.videoCover || '',
    type: item.type,
    status: item.status,
  })
  
  // 如果有视频ID和视频信息，显示已选择的视频
  if (item.videoId && item.videoName) {
    selectedAnime.value = {
      id: item.videoId,
      vodName: item.videoName,
      vodPic: item.videoCover
    }
  } else {
    selectedAnime.value = null
  }
  
  errorMsg.value = ''
  modalVisible.value = true
}

// 搜索番剧
async function searchAnime() {
  if (!animeSearchKeyword.value.trim()) {
    animeSearchResults.value = []
    return
  }
  
  isSearching.value = true
  try {
    const res = await getAnimeList({ 
      keyword: animeSearchKeyword.value.trim(),
      page: 1,
      size: 10
    })
    animeSearchResults.value = res.data.records || []
  } catch (e) {
    console.error('搜索番剧失败', e)
    animeSearchResults.value = []
  } finally {
    isSearching.value = false
  }
}
// 选择番剧
function selectAnime(anime) {
  form.videoId = String(anime.id)
  form.videoName = anime.vodName || ''
  form.videoCover = anime.vodPic || ''
  selectedAnime.value = anime
  animeSearchResults.value = []
  animeSearchKeyword.value = ''
}

// 清除选择的番剧
function clearSelectedAnime() {
  form.videoId = ''
  form.videoName = ''
  form.videoCover = ''
  selectedAnime.value = null
}

async function handleSubmit() {
  submitting.value = true
  errorMsg.value = ''
  try {
    const payload = { 
      ...form, 
      videoId: form.videoId || null,
      videoName: form.videoName || null,
      videoCover: form.videoCover || null
    }
    if (editingId.value) {
      await updateCarousel(editingId.value, payload)
    } else {
      await createCarousel(payload)
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
    if (item.status === 'enabled') {
      await disableCarousel(item.id)
    } else {
      await enableCarousel(item.id)
    }
    fetchList()
  } catch (e) {
    alert(e?.response?.data?.message || '操作失败')
  }
}

async function handleDelete(item) {
  if (!confirm(`确定删除排序为 ${item.sortOrder} 的轮播图？`)) return
  try {
    await deleteCarousel(item.id)
    fetchList()
  } catch (e) {
    alert(e?.response?.data?.message || '删除失败')
  }
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
}

onMounted(fetchList)
</script>

<style scoped>
.carousel-management { padding: 24px; }

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

.video-info-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.video-thumb {
  width: 40px;
  height: 56px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
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

.type-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}
.type-video { background: rgba(59,130,246,0.15); color: #3b82f6; }
.type-ad { background: rgba(251,146,60,0.15); color: #fb923c; }

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

.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
.error-msg {
  color: #f87171; font-size: 13px;
  padding: 8px; background: rgba(248,113,113,0.1); border-radius: 8px;
}
.btn-icon { font-size: 16px; margin-right: 4px; }

/* 番剧搜索样式 */
.anime-search-box {
  position: relative;
}
.search-input-group {
  display: flex;
  gap: 8px;
}
.search-input-group .form-input {
  flex: 1;
}
.btn-search {
  padding: 10px 20px;
  white-space: nowrap;
  min-width: 80px;
}
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid var(--border);
}
.search-result-item:last-child {
  border-bottom: none;
}
.search-result-item:hover {
  background: rgba(99,102,241,0.1);
}
.result-cover {
  width: 50px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}
.result-name {
  font-size: 14px;
  color: var(--text);
  flex: 1;
}
.search-loading {
  padding: 12px;
  text-align: center;
  color: var(--sub);
  font-size: 13px;
}

/* 已选择的番剧显示 */
.selected-anime {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(99,102,241,0.1);
  border: 1px solid rgba(99,102,241,0.3);
  border-radius: 8px;
}
.anime-cover {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}
.anime-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.anime-name {
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
}
.btn-clear {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(239,68,68,0.2);
  color: #ef4444;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.btn-clear:hover {
  background: rgba(239,68,68,0.4);
  transform: scale(1.1);
}
</style>
