<template>
  <div class="anime-list">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="filters" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索番剧标题…"
            clearable
            style="width: 220px"
            @keyup.enter="loadAnime(1)"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select
            v-model="filters.type"
            placeholder="全部分类"
            clearable
            style="width: 150px"
            @change="loadAnime(1)"
          >
            <el-option label="🇯🇵 日韩动漫" value="67" />
            <el-option label="🌎 欧美动漫" value="68" />
            <el-option label="🇨🇳 中文动漫" value="66" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadAnime(1)">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <span class="total-label">{{ animeTotalLabel }}</span>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="animeList" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="200">
          <template #default="{ row }">
            <span class="sub-text">{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="vodName" label="标题" min-width="200" />
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            {{ TYPE_MAP[row.typeId] || row.typeId || '—' }}
          </template>
        </el-table-column>
        <el-table-column label="集数" width="100">
          <template #default="{ row }">第 {{ row.vodTotal }} 集</template>
        </el-table-column>
        <el-table-column label="评分" width="100">
          <template #default="{ row }">{{ row.vodScore || '—' }} ★</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              :loading="recrawlingIds.has(row.id)"
              @click="recrawl(row)"
            >
              {{ recrawlingIds.has(row.id) ? '爬取中...' : '重新爬取' }}
            </el-button>
            <el-button link type="warning" size="small" @click="off(row)">下架</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadAnime"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { animeOff, getAnimeList } from '@/utils/api'
  import { crawlById } from '@/api/crawler'

  const TYPE_MAP: Record<string, string> = {
    '67': '🇯🇵 日韩',
    '68': '🌎 欧美',
    '66': '🇨🇳 中文'
  }

  const loading = ref(false)
  const filters = reactive({
    keyword: '',
    status: '',
    type: ''
  })

  const animeList = ref<any[]>([])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  const animeTotalLabel = ref('')

  // 记录正在爬取的番剧ID
  const recrawlingIds = ref<Set<number>>(new Set())

  const loadAnime = async (page: number) => {
    loading.value = true
    try {
      currentPage.value = page
      const params: any = {
        page,
        size: pageSize.value,
        sort: 'latest'
      }
      if (filters.keyword) {
        params.keyword = filters.keyword
      }
      if (filters.status) {
        params.status = filters.status
      }
      if (filters.type) {
        params.type = filters.type
      }

      const res = await getAnimeList(params)
      animeList.value = res.data.records || []
      total.value = res.data.total || 0
      animeTotalLabel.value = `共 ${total.value} 条`
    } catch (e: any) {
      ElMessage.error(e.message || '加载番剧列表失败')
    } finally {
      loading.value = false
    }
  }

  const handleSizeChange = (size: number) => {
    pageSize.value = size
    loadAnime(1)
  }

  const resetFilter = () => {
    filters.keyword = ''
    filters.status = ''
    filters.type = ''
    loadAnime(1)
  }

  const off = async (anime: any) => {
    try {
      const res = await animeOff(anime.id)
      if (res.code === 200) {
        ElMessage.success('下架成功')
        loadAnime(currentPage.value)
      } else {
        ElMessage.error(res.message || '下架失败')
      }
    } catch (e: any) {
      ElMessage.error(e.message || '下架失败，请稍后重试')
    }
  }

  const recrawl = async (anime: any) => {
    // 添加到爬取中的集合
    recrawlingIds.value.add(anime.id)

    try {
      const res = await crawlById(anime.id)
      if (res.code === 200) {
        ElMessage.success('重新爬取任务已提交')
      } else {
        ElMessage.error(res.message || '重新爬取失败')
      }
    } catch (e: any) {
      ElMessage.error(e.message || '重新爬取失败，请稍后重试')
    } finally {
      // 从爬取中的集合移除
      recrawlingIds.value.delete(anime.id)
      await loadAnime(currentPage.value)
    }
  }

  onMounted(() => {
    loadAnime(1)
  })
</script>

<style scoped>
  .anime-list {
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

  .sub-text {
    color: var(--el-text-color-secondary);
  }

  .total-label {
    margin-left: 12px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
</style>
