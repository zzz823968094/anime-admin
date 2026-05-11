<template>
  <div class="user-management">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <input
        v-model="searchForm.name"
        type="text"
        class="ctrl search-input"
        placeholder="按名称搜索"
        @keyup.enter="handleSearch"
      />
      <select v-model="searchForm.status" class="ctrl search-select" @change="handleSearch">
        <option value="">全部状态</option>
        <option value="NORMAL">正常</option>
        <option value="DISABLE">禁用</option>
      </select>
      <button class="btn btn-primary" @click="handleSearch">搜索</button>
      <button class="btn btn-ghost" @click="handleReset">重置</button>
      <button class="btn btn-primary btn-sm btn-add" @click="handleAdd">
        <svg style="width: 16px; height: 16px; margin-right: 4px; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        新增用户
      </button>
    </div>

    <!-- 表格容器 -->
    <div class="table-container">
      <!-- 表格右上角操作区 -->
      <div class="table-actions">
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>账号</th>
            <th>姓名</th>
            <th>手机号</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="loading-cell">加载中...</td>
          </tr>
          <tr v-else-if="userList.length === 0">
            <td colspan="7" class="empty-cell">暂无数据</td>
          </tr>
          <tr v-else v-for="user in userList" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.account }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.phone }}</td>
            <td>
              <span :class="['status-tag', user.status === 'NORMAL' ? 'status-normal' : 'status-disabled']">
                {{ user.status === 'NORMAL' ? '正常' : '禁用' }}
              </span>
            </td>
            <td>{{ formatDate(user.createTime) }}</td>
            <td class="actions">
              <button class="btn btn-ghost btn-sm" @click="handleEdit(user)">
                <svg style="width: 16px; height: 16px; margin-right: 4px; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                编辑
              </button>
              <button
                class="btn btn-sm"
                :class="user.status === 'NORMAL' ? 'btn-warning' : 'btn-success'"
                @click="handleToggleStatus(user)"
              >
                <svg v-if="user.status === 'NORMAL'" style="width: 16px; height: 16px; margin-right: 4px; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                <svg v-else style="width: 16px; height: 16px; margin-right: 4px; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                {{ user.status === 'NORMAL' ? '禁用' : '启用' }}
              </button>
              <button class="btn btn-danger btn-sm" @click="handleDelete(user)">
                <svg style="width: 16px; height: 16px; margin-right: 4px; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.total > 0" class="pagination">
      <button
        class="btn btn-sm"
        :disabled="pagination.current === 1"
        @click="handlePageChange(pagination.current - 1)"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ pagination.current }} / {{ pagination.pages }} 页，共 {{ pagination.total }} 条
      </span>
      <button
        class="btn btn-sm"
        :disabled="pagination.current === pagination.pages"
        @click="handlePageChange(pagination.current + 1)"
      >
        下一页
      </button>
      <select class="ctrl page-size-select" v-model.number="pagination.pageSize" @change="handlePageSizeChange">
        <option :value="10">10条/页</option>
        <option :value="20">20条/页</option>
        <option :value="50">50条/页</option>
        <option :value="100">100条/页</option>
      </select>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? '编辑用户' : '新增用户' }}</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit" class="form">
            <div class="form-group">
              <label class="form-label">账号</label>
              <input
                v-model="formData.account"
                type="text"
                class="ctrl form-input"
                placeholder="请输入账号"
                :disabled="isEdit"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">姓名</label>
              <input
                v-model="formData.name"
                type="text"
                class="ctrl form-input"
                placeholder="请输入姓名"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">手机号</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="ctrl form-input"
                placeholder="请输入手机号"
                required
              />
            </div>
            <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? '提交中...' : '确定' }}
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
import { getUserList, createUser, updateUser, deleteUser, updateUserStatus } from '@/api/user'

const loading = ref(false)
const userList = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  pages: 0
})

const searchForm = reactive({
  name: '',
  status: ''
})

const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const errorMsg = ref('')
const formData = reactive({
  id: null,
  account: '',
  name: '',
  phone: '',
  password: '',
  status: 'NORMAL'
})

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      name: searchForm.name,
      status: searchForm.status
    })
    
    userList.value = res.data.records
    pagination.total = res.data.total
    pagination.pages = res.data.pages
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchUserList()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.status = ''
  handleSearch()
}

// 分页切换
const handlePageChange = (page) => {
  pagination.current = page
  fetchUserList()
}

// 每页条数变化
const handlePageSizeChange = () => {
  pagination.current = 1
  fetchUserList()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  showModal.value = true
}

// 编辑
const handleEdit = (user) => {
  isEdit.value = true
  formData.id = user.id
  formData.account = user.account
  formData.name = user.name
  formData.phone = user.phone
  formData.password = ''
  formData.status = user.status
  showModal.value = true
}

// 切换状态
const handleToggleStatus = async (user) => {
  const newStatus = user.status === 'NORMAL' ? 'DISABLE' : 'NORMAL'
  const action = newStatus === 'NORMAL' ? '启用' : '禁用'
  
  if (!confirm(`确定要${action}该用户吗？`)) {
    return
  }
  
  try {
    await updateUserStatus(user.id, newStatus)
    fetchUserList()
  } catch (error) {
    console.error(`${action}失败:`, error)
  }
}

// 删除
const handleDelete = async (user) => {
  if (!confirm(`确定要删除用户 "${user.name}" 吗？`)) {
    return
  }
  
  try {
    await deleteUser(user.id)
    fetchUserList()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  submitting.value = true
  errorMsg.value = ''
  
  try {
    if (isEdit.value) {
      const data = {
        name: formData.name,
        phone: formData.phone
      }
      if (formData.password) {
        data.password = formData.password
      }
      await updateUser(formData.id, data)
    } else {
      await createUser({
        account: formData.account,
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        status: formData.status
      })
    }
    
    closeModal()
    fetchUserList()
  } catch (error) {
    errorMsg.value = error.message || '操作失败'
  } finally {
    submitting.value = false
  }
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  resetForm()
  errorMsg.value = ''
}

// 重置表单
const resetForm = () => {
  formData.id = null
  formData.account = ''
  formData.name = ''
  formData.phone = ''
  formData.password = ''
  formData.status = 'NORMAL'
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-management {
  padding: 32px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.table-container {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

/* 表格右上角操作区 */
.table-actions {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: var(--bg);               /* 浅灰表头背景 */
}

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

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background: rgba(0, 0, 0, 0.02);     /* 悬停效果 */
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 40px 16px;
  color: var(--secondary);             /* 次要文字 */
}

.actions {
  display: flex;
  gap: 12px;
}

.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 8px;                  /* 8px 圆角 */
  font-size: 12px;
  font-weight: 500;
}

.status-normal {
  background: rgba(52, 199, 89, 0.12); 
  color: var(--success);               /* 成功绿 #34c759 */
}

.status-disabled {
  background: rgba(255, 59, 48, 0.12); 
  color: var(--danger);                /* 危险红 #ff3b30 */
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.page-info {
  font-size: 14px;
  color: var(--secondary);             /* 次要文字 */
}

.page-size-select {
  padding: 8px 12px;
  font-size: 14px;
}

/* 弹窗样式 - Apple 风格 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);      /* 弱化遮罩 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);         /* 毛玻璃效果 */
}

.modal {
  background: var(--card);             /* 白色背景 */
  border: 1px solid var(--border);
  border-radius: 28px;                 /* 28px 圆角 */
  width: 90%;
  max-width: 500px;
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
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.06);
  color: var(--secondary);             /* 次要文字 #86868b */
  font-size: 20px;
  cursor: pointer;
  border-radius: 50%;                  /* 圆形 */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--text);                  /* 主文字 #1d1d1f */
}

.modal-body {
  padding: 28px;                       /* 加大内边距 */
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.form-input,
.form-select {
  padding: 10px 14px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.error-msg {
  color: var(--danger);                /* 危险色 #ff3b30 */
  font-size: 13px;
  padding: 8px;
  background: rgba(255, 59, 48, 0.12);
  border-radius: 8px;
}

.btn-icon {
  font-size: 16px;
  margin-right: 4px;
}

/* 表格操作按钮样式 - Apple 风格 */
.btn-warning {
  background: rgba(255, 149, 0, 0.1);
  color: var(--warning);               /* 警告橙 #ff9500 */
}

.btn-warning:hover {
  background: rgba(255, 149, 0, 0.2);
  color: var(--accent);                /* hover 时文字变蓝 */
}

.btn-warning:hover svg {
  stroke: var(--accent);               /* hover 时图标变蓝 */
}

.btn-success {
  background: rgba(52, 199, 89, 0.1);
  color: var(--success);               /* 成功绿 #34c759 */
}

.btn-success:hover {
  background: rgba(52, 199, 89, 0.2);
  color: var(--accent);                /* hover 时文字变蓝 */
}

.btn-success:hover svg {
  stroke: var(--accent);               /* hover 时图标变蓝 */
}

.btn-danger {
  background: rgba(255, 59, 48, 0.1);
  color: var(--danger);                /* 危险红 #ff3b30 */
}

.btn-danger:hover {
  background: rgba(255, 59, 48, 0.2);
  color: var(--accent);                /* hover 时文字变蓝 */
}

.btn-danger:hover svg {
  stroke: var(--accent);               /* hover 时图标变蓝 */
}
</style>
