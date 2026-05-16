<template>
  <div class="carousel-management">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="类型">
          <el-select
            v-model="searchForm.type"
            placeholder="全部类型"
            clearable
            style="width: 120px"
          >
            <el-option label="视频" value="video" />
            <el-option label="广告" value="ad" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增轮播图
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="list" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="sortOrder" label="排序" width="80">
          <template #default="{ row }">
            <el-tag size="small">{{ row.sortOrder }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="视频ID" min-width="200">
          <template #default="{ row }">
            <div v-if="row.videoName" class="video-info-cell">
              <el-image :src="row.videoCover" class="video-thumb" fit="cover" />
              <span>{{ row.videoName }}</span>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'video' ? 'success' : 'warning'" size="small">
              {{ row.type === 'video' ? '视频' : '广告' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="修改时间" min-width="160">
          <template #default="{ row }">
            {{ formatDate(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              link
              :type="row.status === 'enabled' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
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
      :title="editingId ? '编辑轮播图' : '新增轮播图'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序" required>
              <el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" required>
              <el-select v-model="form.type" style="width: 100%">
                <el-option label="视频" value="video" />
                <el-option label="广告" value="ad" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="视频">
          <!-- 已选择的视频显示 -->
          <div v-if="selectedAnime" class="selected-anime">
            <el-image :src="selectedAnime.vodPic" class="anime-cover" fit="cover" />
            <div class="anime-info">
              <div class="anime-name">{{ selectedAnime.vodName }}</div>
              <el-button link type="danger" @click="clearSelectedAnime">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- 搜索框 -->
          <div v-else class="anime-search-box">
            <el-input
              v-model="animeSearchKeyword"
              placeholder="输入番剧名称搜索"
              clearable
              @keyup.enter="searchAnime"
            >
              <template #append>
                <el-button :loading="isSearching" @click="searchAnime">搜索</el-button>
              </template>
            </el-input>

            <!-- 搜索结果下拉 -->
            <div v-if="animeSearchResults.length > 0" class="search-results">
              <div
                v-for="anime in animeSearchResults"
                :key="anime.id"
                class="search-result-item"
                @click="selectAnime(anime)"
              >
                <el-image :src="anime.vodPic" class="result-cover" fit="cover" />
                <span class="result-name">{{ anime.vodName }}</span>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
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
  import { Plus, Close } from '@element-plus/icons-vue'
  import {
    getCarouselList,
    createCarousel,
    updateCarousel,
    deleteCarousel,
    enableCarousel,
    disableCarousel
  } from '@/api/carousel'
  import { getAnimeList } from '@/utils/api'
  import type { Carousel } from '@/types/api'

  const loading = ref(false)
  const list = ref<Carousel[]>([])
  const pagination = reactive({ current: 1, pageSize: 10, total: 0 })
  const searchForm = reactive({ type: '', status: '' })

  const modalVisible = ref(false)
  const editingId = ref<number | null>(null)
  const submitting = ref(false)

  // 视频搜索相关
  const animeSearchKeyword = ref('')
  const animeSearchResults = ref<any[]>([])
  const isSearching = ref(false)
  const selectedAnime = ref<any>(null)

  const form = reactive({
    sortOrder: 0,
    videoId: '',
    videoName: '',
    videoCover: '',
    type: 'video',
    status: 'enabled'
  })

  async function fetchList() {
    loading.value = true
    try {
      const res = await getCarouselList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        type: searchForm.type || undefined,
        status: searchForm.status || undefined
      })
      list.value = res.data.list || []
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
    searchForm.type = ''
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
    modalVisible.value = true
  }

  function handleEdit(item: Carousel) {
    editingId.value = item.id
    Object.assign(form, {
      sortOrder: item.sortOrder,
      videoId: item.videoId || '',
      videoName: item.videoName || '',
      videoCover: item.videoCover || '',
      type: item.type,
      status: item.status
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
      animeSearchResults.value = res.data.list || []
    } catch (e: any) {
      ElMessage.error(e.message || '搜索失败')
      animeSearchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  // 选择番剧
  function selectAnime(anime: any) {
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
    try {
      const payload = {
        ...form,
        videoId: form.videoId || null,
        videoName: form.videoName || null,
        videoCover: form.videoCover || null
      }
      if (editingId.value) {
        await updateCarousel(editingId.value, payload)
        ElMessage.success('更新成功')
      } else {
        await createCarousel(payload)
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

  async function handleToggleStatus(item: Carousel) {
    try {
      if (item.status === 'enabled') {
        await disableCarousel(item.id)
        ElMessage.success('已禁用')
      } else {
        await enableCarousel(item.id)
        ElMessage.success('已启用')
      }
      fetchList()
    } catch (e: any) {
      ElMessage.error(e.message || '操作失败')
    }
  }

  async function handleDelete(item: Carousel) {
    try {
      await ElMessageBox.confirm(`确定删除排序为 ${item.sortOrder} 的轮播图？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteCarousel(item.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (e: any) {
      if (e !== 'cancel') {
        ElMessage.error(e.message || '删除失败')
      }
    }
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
  .carousel-management {
    padding: 24px;
  }

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    margin-bottom: 20px;
  }

  .video-info-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .video-thumb {
    width: 40px;
    height: 56px;
    border-radius: 4px;
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  /* 番剧搜索样式 */
  .anime-search-box {
    position: relative;
    width: 100%;
  }

  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 100;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  }

  .search-result-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .search-result-item:last-child {
    border-bottom: none;
  }

  .search-result-item:hover {
    background: rgba(99, 102, 241, 0.1);
  }

  .result-cover {
    width: 50px;
    height: 70px;
    border-radius: 6px;
  }

  .result-name {
    font-size: 14px;
    color: var(--el-text-color-primary);
    flex: 1;
  }

  /* 已选择的番剧显示 */
  .selected-anime {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 8px;
  }

  .anime-cover {
    width: 60px;
    height: 80px;
    border-radius: 6px;
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
    color: var(--el-text-color-primary);
    flex: 1;
  }

  .anime-info-btn {
    font-size: 14px;
    color: var(--text);
    font-weight: 500;
  }
  .btn-clear {
    width: 28px;
    height: 28px;
    border: none;
    background: rgba(239, 68, 68, 0.2);
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
    background: rgba(239, 68, 68, 0.4);
  }
</style>
