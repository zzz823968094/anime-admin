<template>
  <div class="user-management">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <button class="btn btn-primary" @click="handleAdd">
        <span class="btn-icon">+</span> 新增用户
      </button>
    </div>

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
      <button class="btn btn-secondary" @click="handleReset">重置</button>
    </div>

    <!-- 表格 -->
    <div class="table-container">
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
              <button class="btn btn-ghost btn-sm" @click="handleEdit(user)">编辑</button>
              <button
                class="btn btn-sm"
                :class="user.status === 'NORMAL' ? 'btn-warning' : 'btn-success'"
                @click="handleToggleStatus(user)"
              >
                {{ user.status === 'NORMAL' ? '禁用' : '启用' }}
              </button>
              <button class="btn btn-danger btn-sm" @click="handleDelete(user)">删除</button>
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
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
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

.search-input {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.search-select {
  padding: 10px 14px;
  font-size: 14px;
  min-width: 150px;
}

.table-container {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: rgba(255, 255, 255, 0.05);
}

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

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 40px 16px;
  color: var(--sub);
}

.actions {
  display: flex;
  gap: 12px;
}

.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-normal {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-disabled {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
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
  color: var(--sub);
}

.page-size-select {
  padding: 8px 12px;
  font-size: 14px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
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
  max-width: 500px;
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

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--sub);
  font-size: 24px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-body {
  padding: 24px;
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
  color: #f87171;
  font-size: 13px;
  padding: 8px;
  background: rgba(248, 113, 113, 0.1);
  border-radius: 8px;
}

.btn-icon {
  font-size: 16px;
  margin-right: 4px;
}
</style>
