<template>
  <div class="search-stats">
    <el-card shadow="never" class="stats-card">
      <template #header>
        <div class="card-header">

          <span class="label">查询&nbsp;&nbsp;  </span>
          <el-select v-model="defaultDays" placeholder="Select" style="width: 240px;" @change="loadData()">
            <el-option
                v-for="item in daysList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
          <span class="label">&nbsp;&nbsp;数据</span>
        </div>
      </template>
      <div v-if="keywordList.length" class="keywords-list">
        <el-table :data="keywordList" :pagination="pagination" style="width: 100%">
          <el-table-column type="index" width="50"/>
          <el-table-column prop="keyword" label="搜索关键词"/>
          <el-table-column prop="cnt" label="搜索次数"/>
        </el-table>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.currentPage"
            :page-sizes="[10, 20, 30, 40]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total">
        </el-pagination>
      </div>
      <el-empty v-else description="暂无搜索数据"/>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {getSearchStats} from '@/utils/api'

const keywordList = ref([])
const pagination = ref({
  currentPage: 1, // 当前页
  pageSize: 10, // 每页显示条数
  total: 0, // 总条数
  layout: 'total,sizes,prev, pager, next, jumper', // 分页布局
})
const defaultDays = ref(1)
const daysList = ref([
  {
    value: 1,
    label: '1日内',
  },
  {
    value: 3,
    label: '3日内',
  },
  {
    value: 7,
    label: '1周内',
  },
  {
    value: 30,
    label: '1月内',
  }
])

const loading = ref(false)
// 改变分页大小
const handleSizeChange = async (pageSize: number) => {
  console.log('handleSizeChange', pageSize)
  pagination.value.pageSize = pageSize;
  loadData();
}

const handleCurrentChange = async (pageNum: number) => {
  console.log('handleCurrentChange', pageNum)
  pagination.value.currentPage = pageNum;
  loadData();
}

const loadData = () => {
  loadSearchStats(defaultDays.value)
}

const loadSearchStats = async (days: number) => {
  loading.value = true
  try {
    const res = await getSearchStats({
      pageNum: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      days: days
    })
    const data = res.data
    keywordList.value = data.records
    pagination.value.total = data.total
  } catch (e: any) {
    console.error('加载搜索统计失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSearchStats(defaultDays.value)
})
</script>

<style scoped>
.search-stats {
  padding: 24px;
}

.stats-card {
  height: 100%;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.keywords-list {
  display: flex;
  flex-direction: column;
}

.keyword-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.keyword-rank {
  width: 22px;
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.keyword-text {
  flex: 1;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.keyword-progress {
  width: 80px;
}

.keyword-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  width: 36px;
  text-align: right;
}

.overview-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
