<template>
  <div>
    <div class="page-hd">
      <div class="page-title">网站用户管理</div>
      <div class="page-stats">
        <span class="stat-item">
          <span class="stat-label">总用户数</span>
          <span class="stat-value">{{ totalCount }}</span>
        </span>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="card">
      <div class="search-bar">
        <input
          v-model="searchForm.username"
          type="text"
          class="ctrl search-input"
          placeholder="按用户名搜索"
          @keyup.enter="handleSearch"
        />
        <select v-model="searchForm.status" class="ctrl search-select" @change="handleSearch">
          <option value="">全部状态</option>
          <option value="0">正常</option>
          <option value="1">封禁</option>
        </select>
        <button class="btn btn-primary" @click="handleSearch">搜索</button>
        <button class="btn btn-ghost" @click="handleReset">重置</button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="card">
      <div v-if="loading" class="loading-state">加载中...</div>

      <div v-else-if="userList.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <div class="empty-text">暂无用户数据</div>
      </div>

      <table v-else class="tbl">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>积分</th>
            <th>最后登录</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userList" :key="user.id">
            <td>{{ user.id }}</td>
            <td>
              <div class="user-cell">
                <img
                  v-if="user.avatar"
                  :src="user.avatar"
                  :alt="user.username"
                  class="user-avatar"
                  @error="handleAvatarError"
                />
                <div v-else class="user-avatar-placeholder">
                  {{ user.username.charAt(0).toUpperCase() }}
                </div>
                <span class="username-text">{{ user.username }}</span>
              </div>
            </td>
            <td>{{ user.email || '-' }}</td>
            <td>
              <span :class="['badge', user.role === 1 ? 'b-purple' : 'b-blue']">
                {{ user.role === 1 ? '管理员' : '普通用户' }}
              </span>
            </td>
            <td>
              <span :class="['badge', user.status === 0 ? 'b-green' : 'b-red']">
                {{ user.status === 0 ? '正常' : '封禁' }}
              </span>
            </td>
            <td>{{ user.points || 0 }}</td>
            <td>{{ formatDateTime(user.lastLoginAt) }}</td>
            <td>{{ formatDateTime(user.createdAt) }}</td>
            <td>
              <div class="action-buttons">
                <button
                  :class="['btn btn-sm', user.status === 0 ? 'btn-warning' : 'btn-success']"
                  @click="handleToggleStatus(user)"
                  :disabled="user.role === 1"
                >
                  {{ user.status === 0 ? '封禁' : '解封' }}
                </button>
                <button
                  class="btn btn-danger btn-sm"
                  @click="handleDelete(user)"
                  :disabled="user.role === 1"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="pager">
        <button
          class="pg-btn"
          :disabled="pagination.current === 1"
          @click="handlePageChange(pagination.current - 1)"
        >
          上一页
        </button>
        <span class="pg-info">
          第 {{ pagination.current }} / {{ totalPages }} 页，共 {{ pagination.total }} 条
        </span>
        <button
          class="pg-btn"
          :disabled="pagination.current >= totalPages"
          @click="handlePageChange(pagination.current + 1)"
        >
          下一页
        </button>
        <select class="ctrl pg-size-select" v-model.number="pagination.pageSize" @change="handlePageSizeChange">
          <option :value="10">10条/页</option>
          <option :value="20">20条/页</option>
          <option :value="50">50条/页</option>
          <option :value="100">100条/页</option>
        </select>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { getSiteUserList, getSiteUserCount, updateSiteUserStatus, deleteSiteUser } from '@/api/siteUser'

const loading = ref(false)
const userList = ref([])
const totalCount = ref(0)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize))

const searchForm = reactive({
  username: '',
  status: ''
})

const toast = reactive({
  show: false,
  message: '',
  type: 'success'
})

// 显示 Toast 提示
const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const res = await getSiteUserList({
      page: pagination.current,
      size: pagination.pageSize,
      username: searchForm.username,
      status: searchForm.status
    })

    // 根据后端实际响应结构调整
    userList.value = res.data || []
    pagination.total = userList.value.length
  } catch (error) {
    console.error('获取用户列表失败:', error)
    showToast('加载用户列表失败', 'error')
  } finally {
    loading.value = false
  }
}

// 获取用户总数
const fetchTotalCount = async () => {
  try {
    const res = await getSiteUserCount()
    totalCount.value = res.data || 0
  } catch (error) {
    console.error('获取用户总数失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchUserList()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.status = ''
  handleSearch()
}

// 分页切换
const handlePageChange = (page) => {
  if (page < 1 || page > totalPages.value) return
  pagination.current = page
  fetchUserList()
}

// 每页条数变化
const handlePageSizeChange = () => {
  pagination.current = 1
  fetchUserList()
}

// 切换状态
const handleToggleStatus = async (user) => {
  if (user.role === 1) {
    showToast('无法修改管理员状态', 'error')
    return
  }

  const newStatus = user.status === 0 ? 1 : 0
  const action = newStatus === 0 ? '解封' : '封禁'

  if (!confirm(`确定要${action}用户 "${user.username}" 吗？`)) {
    return
  }

  try {
    await updateSiteUserStatus(user.id, newStatus)
    showToast(`${action}成功`)
    fetchUserList()
    fetchTotalCount()
  } catch (error) {
    console.error(`${action}失败:`, error)
    showToast(`${action}失败`, 'error')
  }
}

// 删除用户
const handleDelete = async (user) => {
  if (user.role === 1) {
    showToast('无法删除管理员账号', 'error')
    return
  }

  if (!confirm(`确定要删除用户 "${user.username}" 吗？此操作不可恢复！`)) {
    return
  }

  try {
    await deleteSiteUser(user.id)
    showToast('删除成功')
    fetchUserList()
    fetchTotalCount()
  } catch (error) {
    console.error('删除失败:', error)
    showToast('删除失败', 'error')
  }
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
    minute: '2-digit'
  })
}

// 头像加载失败处理
const handleAvatarError = (e) => {
  e.target.style.display = 'none'
}

onMounted(() => {
  fetchUserList()
  fetchTotalCount()
})
</script>

<style scoped>
.page-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 14px;
}

.stat-label {
  font-size: 12px;
  color: var(--sub);
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent2);
}

.search-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.search-select {
  padding: 7px 12px;
  font-size: 13px;
  min-width: 150px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}

.username-text {
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
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
  color: var(--text);
}

.pager {
  display: flex;
  gap: 6px;
  margin-top: 14px;
  justify-content: center;
  align-items: center;
}

.pg-btn {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--sub);
  padding: 5px 11px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  transition: all 0.15s;
}

.pg-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--text);
}

.pg-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pg-info {
  font-size: 12px;
  color: var(--sub);
}

.pg-size-select {
  padding: 5px 8px;
  font-size: 12px;
  margin-left: 8px;
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

@media (max-width: 768px) {
  .page-hd {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-input,
  .search-select {
    max-width: 100%;
  }

  table {
    font-size: 12px;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
