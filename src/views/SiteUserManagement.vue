<template>
  <div class="site-user-management">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="按用户名搜索"
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
            <el-option label="正常" value="0" />
            <el-option label="封禁" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="userList"
        border
        stripe
        style="width: 100%"
        empty-text="暂无用户数据"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户名" min-width="150">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar v-if="row.avatar" :src="row.avatar" :alt="row.username" size="small" />
              <el-avatar v-else size="small">
                {{ row.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="username-text">{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180">
          <template #default="{ row }">
            {{ row.email || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 1 ? 'purple' : 'blue'" size="small">
              {{ row.role === 1 ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'" size="small">
              {{ row.status === 0 ? '正常' : '封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="80">
          <template #default="{ row }">
            {{ row.points || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="最后登录" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.lastLoginAt) }}
          </template>
        </el-table-column>
        <el-table-column label="注册时间" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              :type="row.status === 0 ? 'warning' : 'success'"
              size="small"
              :disabled="row.role === 1"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 0 ? '封禁' : '解封' }}
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              :disabled="row.role === 1"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    getSiteUserList,
    getSiteUserCount,
    updateSiteUserStatus,
    deleteSiteUser
  } from '@/api/siteUser'
  import type { SiteUser } from '@/types/api'

  const loading = ref(false)
  const userList = ref<SiteUser[]>([])
  const totalCount = ref(0)

  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0
  })

  const searchForm = reactive({
    username: '',
    status: ''
  })

  // 获取用户列表
  const fetchUserList = async () => {
    loading.value = true
    try {
      const res = await getSiteUserList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        username: searchForm.username || undefined,
        status: searchForm.status || undefined
      })

      userList.value = res.data.list || []
      pagination.total = res.data.total
    } catch (error: any) {
      ElMessage.error(error.message || '加载用户列表失败')
    } finally {
      loading.value = false
    }
  }

  // 获取用户总数
  const fetchTotalCount = async () => {
    try {
      const res = await getSiteUserCount()
      totalCount.value = res.data || 0
    } catch (error: any) {
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
  const handlePageChange = (page: number) => {
    pagination.current = page
    fetchUserList()
  }

  // 每页条数变化
  const handlePageSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.current = 1
    fetchUserList()
  }

  // 切换状态
  const handleToggleStatus = async (user: SiteUser) => {
    if (user.role === 1) {
      ElMessage.warning('无法修改管理员状态')
      return
    }

    const newStatus = user.status === 0 ? 1 : 0
    const action = newStatus === 0 ? '解封' : '封禁'

    try {
      await ElMessageBox.confirm(`确定要${action}用户 "${user.username}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await updateSiteUserStatus(user.id, newStatus)
      ElMessage.success(`${action}成功`)
      fetchUserList()
      fetchTotalCount()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || `${action}失败`)
      }
    }
  }

  // 删除用户
  const handleDelete = async (user: SiteUser) => {
    if (user.role === 1) {
      ElMessage.warning('无法删除管理员账号')
      return
    }

    try {
      await ElMessageBox.confirm(`确定要删除用户 "${user.username}" 吗？此操作不可恢复！`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await deleteSiteUser(user.id)
      ElMessage.success('删除成功')
      fetchUserList()
      fetchTotalCount()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '删除失败')
      }
    }
  }

  // 格式化日期时间
  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) {
      return '-'
    }
    const date = new Date(dateTime)
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
    fetchTotalCount()
  })
</script>

<style scoped>
  .site-user-management {
    padding: 24px;
  }

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    margin-bottom: 20px;
  }

  .user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .username-text {
    font-weight: 500;
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
</style>
