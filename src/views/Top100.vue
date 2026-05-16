<template>
  <div class="top100">
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">播放量排行榜 TOP 100</div>
      </template>
      <el-table v-loading="loading" :data="top100List" border stripe style="width: 100%">
        <el-table-column label="排名" width="80">
          <template #default="{ $index }">
            <el-tag :type="getRankType($index + 1)" effect="dark" size="small">
              {{ $index + 1 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="番剧" min-width="200" />
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            {{ TYPE_MAP[row.type] || row.type || '—' }}
          </template>
        </el-table-column>
        <el-table-column label="集数" width="100">
          <template #default="{ row }">第 {{ row.currentEpisode }} 集</template>
        </el-table-column>
        <el-table-column label="评分" width="100">
          <template #default="{ row }">
            {{ row.score || '—' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ STATUS_MAP[row.status]?.[0] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="播放量" width="150" align="right">
          <template #default="{ row }">
            <span class="view-count">{{ (row.viewCount || 0).toLocaleString() }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { getTop100 } from '@/utils/api'

  const loading = ref(false)
  const TYPE_MAP: Record<string, string> = {
    '67': '🇯🇵 日韩',
    '68': '🌎 欧美',
    '66': '🇨🇳 中文'
  }
  const STATUS_MAP: Record<number, [string, string]> = {
    0: ['已下线', 'b-red'],
    1: ['连载中', 'b-green'],
    2: ['已完结', 'b-blue']
  }

  const top100List = ref<any[]>([])

  const getRankType = (rank: number): 'success' | 'warning' | 'danger' | 'info' => {
    if (rank === 1) {
      return 'danger'
    }
    if (rank === 2) {
      return 'warning'
    }
    if (rank === 3) {
      return 'success'
    }
    return 'info'
  }

  const getStatusType = (status: number): 'success' | 'warning' | 'danger' | 'info' => {
    const typeMap: Record<number, 'success' | 'warning' | 'danger' | 'info'> = {
      0: 'danger',
      1: 'success',
      2: 'primary'
    }
    return typeMap[status] || 'info'
  }

  const loadTop100 = async () => {
    loading.value = true
    try {
      const res = await getTop100()
      top100List.value = res.data || []
    } catch (e: any) {
      console.error('加载排行榜失败', e)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadTop100()
  })
</script>

<style scoped>
  .top100 {
    padding: 24px;
  }

  .table-card {
    margin-bottom: 20px;
  }

  .card-header {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .view-count {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
</style>
