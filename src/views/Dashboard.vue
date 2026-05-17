<template>
  <div class="dashboard-content">
    <!-- 统计卡片网格 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :sm="12" :md="4" :lg="4" :xl="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :size="32" color="#409EFF"><VideoPlay /></el-icon>
            <div class="stat-info">
              <div class="stat-val">{{ stats.totalAnime || '0' }}</div>
              <div class="stat-lbl">番剧总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="25" :sm="12" :md="5" :lg="5" :xl="5">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :size="32" color="#67C23A"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-val">{{ stats.totalUser || '0' }}</div>
              <div class="stat-lbl">注册用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="25" :sm="12" :md="5" :lg="5" :xl="5">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :size="32" color="#67C23A"><UserFilled /></el-icon>
            <div class="stat-info">
              <div class="stat-val">{{ accessData.totalUserCount || '—' }}</div>
              <div class="stat-lbl">(总)访问人数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="25" :sm="12" :md="5" :lg="5" :xl="5">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :size="32" color="#E6A23C"><Clock /></el-icon>
            <div class="stat-info">
              <div class="stat-val">{{ stats.todayView || '0' }}</div>
              <div class="stat-lbl">今日播放量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="25" :sm="12" :md="5" :lg="5" :xl="5">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :size="32" color="#F56C6C"><TrendCharts /></el-icon>
            <div class="stat-info">
              <div class="stat-val">{{ stats.totalView || '0' }}</div>
              <div class="stat-lbl">总播放量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统维护模式卡片 -->
    <el-card shadow="never" class="system-update-card mb-4">
      <template #header>
        <div class="update-header">
          <div class="update-title">
            <el-icon :size="24"><Tools /></el-icon>
            <span>系统维护模式</span>
          </div>
          <el-tag :type="systemUpdate.updating ? 'warning' : 'success'" size="large">
            {{ systemUpdate.updating ? '维护中' : '正常运行' }}
          </el-tag>
        </div>
      </template>

      <div class="update-content">
        <div class="update-info">
          <div class="info-item">
            <span class="info-label">当前状态：</span>
            <el-tag :type="systemUpdate.updating ? 'warning' : 'success'">
              {{ systemUpdate.updating ? '系统正在维护升级' : '系统正常运行' }}
            </el-tag>
          </div>
          <div v-if="systemUpdate.message" class="info-item mt-2">
            <span class="info-label">提示信息：</span>
            <span class="text-secondary">{{ systemUpdate.message }}</span>
          </div>
        </div>

        <div class="update-actions">
          <el-button
            :type="systemUpdate.updating ? 'success' : 'primary'"
            :loading="loadingUpdate"
            @click="handleToggleUpdate"
          >
            {{ loadingUpdate ? '处理中...' : systemUpdate.updating ? '恢复服务' : '开启维护' }}
          </el-button>
          <el-button :disabled="loadingUpdate" @click="showEditMessage = true">编辑提示</el-button>
        </div>
      </div>
    </el-card>

    <!-- 日活趋势图 -->
    <el-card shadow="never" class="mb-4">
      <template #header>
        <div class="chart-header">
          <h3 class="sec-title">日活趋势</h3>
          <el-radio-group v-model="selectedDays" size="small" @change="changeTimeRange">
            <el-radio-button :label="7">7天</el-radio-button>
            <el-radio-button :label="30">30天</el-radio-button>
            <el-radio-button :label="90">90天</el-radio-button>
            <el-radio-button :label="180">180天</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-skeleton v-if="loadingAccess" :rows="5" animated />
      <el-empty
        v-else-if="!accessData.trend || accessData.trend.length === 0"
        description="暂无数据"
      />
      <div v-else ref="chartContainer" class="chart-container" />
    </el-card>

    <!-- 设备统计排名 -->
    <el-card shadow="never" class="mb-4">
      <template #header>
        <div class="chart-header">
          <h3 class="sec-title">
            <el-icon :size="24" style="vertical-align: middle; margin-right: 8px">
              <Cellphone />
            </el-icon>
            设备型号统计排名
          </h3>
          <el-radio-group v-model="deviceSelectedDays" size="small" @change="changeDeviceTimeRange">
            <el-radio-button :label="7">7天</el-radio-button>
            <el-radio-button :label="30">30天</el-radio-button>
            <el-radio-button :label="90">90天</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-skeleton v-if="loadingDevice" :rows="5" animated />
      <el-empty
        v-else-if="!deviceData.trend || deviceData.trend.length === 0"
        description="暂无设备数据"
      />
      <el-table v-else :data="topDevices" border stripe>
        <el-table-column label="排名" width="80">
          <template #default="{ $index }">
            <el-tag :type="getRankType($index)" effect="dark" size="small">
              {{ $index + 1 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deviceModel" label="设备型号" min-width="150" />
        <el-table-column prop="osName" label="操作系统" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.os }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userCount" label="访问人数" width="120">
          <template #default="{ row }">
            <strong>{{ row.userCount }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="占比" min-width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="getPercentage(row.userCount)"
              :show-text="true"
              :stroke-width="12"
              :color="getProgressColor(getPercentage(row.userCount))"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>


    <!-- 编辑提示对话框 -->
    <el-dialog v-model="showEditMessage" title="编辑维护提示信息" width="500px">
      <el-input
        v-model="editMessage"
        type="textarea"
        :rows="4"
        placeholder="请输入维护提示信息..."
      />

      <template #footer>
        <el-button @click="showEditMessage = false">取消</el-button>
        <el-button type="primary" :loading="loadingUpdate" @click="handleUpdateMessage">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, nextTick, onUnmounted, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    Tools,
    VideoPlay,
    User,
    Clock,
    TrendCharts,
    Cellphone,
    UserFilled
  } from '@element-plus/icons-vue'
  import {
    getAnimeStats,
    getUserCount,
    getAnimeList,
    getAccessStats,
    getDeviceStats,
    getSystemUpdateStatus,
    setSystemUpdateStatus,
    toggleSystemUpdate
  } from '@/utils/api'
  import * as echarts from 'echarts'

  // 系统更新状态
  const systemUpdate = reactive({
    updating: false,
    message: ''
  })
  const loadingUpdate = ref(false)
  const showEditMessage = ref(false)
  const editMessage = ref('')

  const stats = reactive({
    totalAnime: '—',
    totalVideo: '统计中',
    totalUser: '—',
    totalView: '—',
    todayView: '—'
  })

  const typeStats = ref<any[]>([])
  const recentAnime = ref<any[]>([])

  const loadingAccess = ref(false)
  const selectedDays = ref(7)
  const accessData = reactive({
    todayAppUV: 0,
    todayWebUV: 0,
    totalUserCount: 0,
    trend: [],
    rawTrend: [] // 保存原始数据
  })
  const chartContainer = ref<HTMLElement | null>(null)
  let chartInstance: echarts.ECharts | null = null

  // 设备统计相关
  const loadingDevice = ref(false)
  const deviceSelectedDays = ref(7)
  const deviceData = reactive({
    totalUserCount: 0,
    trend: [],
    rawTrend: [] // 保存原始数据
  })

  // 加载统计数据
  const loadStats = async () => {
    try {
      const res = await getAnimeStats()
      const s = res.data
      stats.totalAnime = (s.totalAnime || 0).toLocaleString()
      stats.totalView = (s.totalView || 0).toLocaleString()
      stats.todayView = (s.todayView || 0).toLocaleString()
      typeStats.value = [
        { type: 'jp', label: '日韩动漫', count: (s.jpCount || 0).toLocaleString() },
        { type: 'us', label: '欧美动漫', count: (s.usCount || 0).toLocaleString() },
        { type: 'cn', label: '中文动漫', count: (s.cnCount || 0).toLocaleString() },
      ]
    } catch (e: any) {
      console.error('加载统计失败', e)
    }
  }

  const loadUserCount = async () => {
    try {
      const res = await getUserCount()
      if (res.code === 200) {
        stats.totalUser = res.data
      }
    } catch (e: any) {
      console.error('加载用户数失败', e)
    }
  }

  const loadRecentAnime = async () => {
    try {
      const res = await getAnimeList({ page: 1, size: 10, sort: 'latest' })
      recentAnime.value = res.data.records || []
    } catch (e: any) {
      console.error('加载最新番剧失败', e)
    }
  }

  const loadAccessStats = async (days: number) => {
    try {
      loadingAccess.value = true
      const res = await getAccessStats(days)
      if (res.code === 200) {
        accessData.todayAppUV = res.data.todayAppUV || 0
        accessData.todayWebUV = res.data.todayWebUV || 0
        accessData.totalUserCount = res.data.totalUserCount || 0

        // 保存原始趋势数据
        const rawTrend = res.data.trend || []
        accessData.rawTrend = rawTrend

        // 补全指定天数的数据，缺失的日期自动填充为0
        const completeTrend = fillMissingDates(rawTrend, days)
        accessData.trend = completeTrend

        // 先销毁旧实例，避免DOM切换后实例失效
        if (chartInstance) {
          chartInstance.dispose()
          chartInstance = null
        }

        // 等待DOM更新后绘制图表
        await nextTick()
        setTimeout(() => {
          drawChart()
        }, 200)
      }
    } catch (e: any) {
      console.error('加载访问统计失败', e)
    } finally {
      loadingAccess.value = false
    }
  }

  // 切换时间范围
  const changeTimeRange = (days: number) => {
    selectedDays.value = days
    loadAccessStats(days)
  }

  // 补全缺失日期的数据
  const fillMissingDates = (trendData: any[], days: number) => {
    if (!trendData || trendData.length === 0) {
      return generateEmptyTrend(days)
    }

    const today = new Date()
    const result = []
    const dataMap = new Map()

    trendData.forEach((item: any) => {
      dataMap.set(String(item.date), item)
    })

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateKey = `${year}${month}${day}`

      if (dataMap.has(dateKey)) {
        result.push(dataMap.get(dateKey))
      } else {
        result.push({
          id: 0,
          date: parseInt(dateKey),
          webUserCount: 0,
          appUserCount: 0,
          ip: '{"appIp":[],"webIp":[]}',
          createdAt: `${year}-${month}-${day}T00:00:00`,
          updatedAt: `${year}-${month}-${day}T00:00:00`
        })
      }
    }

    return result
  }

  // 生成全0的趋势数据
  const generateEmptyTrend = (days: number) => {
    const today = new Date()
    const result = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateKey = `${year}${month}${day}`

      result.push({
        date: parseInt(dateKey),
        webUserCount: 0,
        appUserCount: 0,
        createdAt: `${year}-${month}-${day}T00:00:00`
      })
    }

    return result
  }

  // 绘制图表
  const drawChart = () => {
    if (!chartContainer.value) {
      return
    }

    if (!chartInstance) {
      chartInstance = echarts.init(chartContainer.value)
    }

    const dates = accessData.trend.map((item: any) => {
      const dateStr = String(item.date)
      return `${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
    })

    const webData = accessData.trend.map((item: any) => item.webUserCount || 0)
    const appData = accessData.trend.map((item: any) => item.appUserCount || 0)

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['Web访问', 'App访问'],
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Web访问',
          type: 'line',
          smooth: true,
          data: webData,
          areaStyle: { opacity: 0.3 },
          itemStyle: { color: '#409EFF' }
        },
        {
          name: 'App访问',
          type: 'line',
          smooth: true,
          data: appData,
          areaStyle: { opacity: 0.3 },
          itemStyle: { color: '#67C23A' }
        }
      ]
    }

    chartInstance.setOption(option)
  }

  // 窗口resize处理
  const handleResize = () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  }

  // 计算前10的设备
  const topDevices = computed(() => {
    if (!deviceData.trend || deviceData.trend.length === 0) {
      return []
    }

    const sorted = [...deviceData.trend].sort((a: any, b: any) => {
      return (b.userCount || 0) - (a.userCount || 0)
    })

    return sorted.slice(0, 10)
  })

  // 获取排名样式类型
  const getRankType = (index: number): 'danger' | 'warning' | 'success' | 'info' => {
    if (index === 0) {
      return 'danger'
    }
    if (index === 1) {
      return 'warning'
    }
    if (index === 2) {
      return 'success'
    }
    return 'info'
  }

  // 计算百分比
  const getPercentage = (userCount: number) => {
    if (!deviceData.totalUserCount || deviceData.totalUserCount === 0) {
      return 0
    }
    return Math.round(((userCount || 0) / deviceData.totalUserCount) * 100)
  }

  // 获取进度条颜色
  const getProgressColor = (percentage: number) => {
    if (percentage >= 30) {
      return '#67C23A'
    }
    if (percentage >= 15) {
      return '#E6A23C'
    }
    return '#409EFF'
  }

  // 切换设备统计时间范围
  const changeDeviceTimeRange = async (days: number) => {
    deviceSelectedDays.value = days
    await loadDeviceStats(days)
  }

  // 加载设备统计数据
  const loadDeviceStats = async (days = 7) => {
    try {
      loadingDevice.value = true
      const res = await getDeviceStats({ days })
      if (res.code === 200) {
        deviceData.totalUserCount = res.data.totalUserCount || 0
        deviceData.rawTrend = res.data.trend || []
        deviceData.trend = res.data.trend || []
      }
    } catch (e: any) {
      console.error('加载设备统计失败', e)
    } finally {
      loadingDevice.value = false
    }
  }

  // 加载系统更新状态
  const loadSystemUpdateStatus = async () => {
    try {
      const res = await getSystemUpdateStatus()
      if (res.code === 200) {
        systemUpdate.updating = res.data.updating
        systemUpdate.message = res.data.message || ''
      }
    } catch (e: any) {
      console.error('加载系统更新状态失败', e)
    }
  }

  // 切换系统更新状态
  const handleToggleUpdate = async () => {
    try {
      loadingUpdate.value = true
      const res = await toggleSystemUpdate()
      if (res.code === 200) {
        await loadSystemUpdateStatus()
        ElMessage.success(res.message || '操作成功')
      }
    } catch (e: any) {
      console.error('切换系统更新状态失败', e)
      ElMessage.error('操作失败：' + (e.response?.data?.message || e.message))
    } finally {
      loadingUpdate.value = false
    }
  }

  // 更新提示信息
  const handleUpdateMessage = async () => {
    try {
      loadingUpdate.value = true
      const res = await setSystemUpdateStatus({
        updating: systemUpdate.updating,
        message: editMessage.value
      })
      if (res.code === 200) {
        systemUpdate.message = editMessage.value
        showEditMessage.value = false
        ElMessage.success('提示信息已更新')
      }
    } catch (e: any) {
      console.error('更新提示信息失败', e)
      ElMessage.error('更新失败：' + (e.response?.data?.message || e.message))
    } finally {
      loadingUpdate.value = false
    }
  }

  onMounted(() => {
    loadStats()
    loadUserCount()
    loadRecentAnime()
    loadAccessStats(7)
    loadDeviceStats()
    loadSystemUpdateStatus()

    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)

    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
  })
</script>

<style scoped>
  .dashboard-content {
    padding: 24px;
  }

  .mb-4 {
    margin-bottom: 20px;
  }

  /* 系统更新状态卡片 */
  .system-update-card {
    background: var(--el-bg-color);
  }

  .update-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .update-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .update-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    flex-wrap: wrap;
  }

  .update-info {
    flex: 1;
    min-width: 300px;
  }

  .info-item {
    margin-bottom: 12px;
    color: var(--el-text-color-primary);
  }

  .info-label {
    color: var(--el-text-color-secondary);
    margin-right: 8px;
  }

  .text-secondary {
    color: var(--el-text-color-secondary);
  }

  .mt-2 {
    margin-top: 8px;
  }

  .update-actions {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
  }

  /* 统计卡片 */
  .stat-card {
    height: 100%;
    transition: transform 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat-info {
    flex: 1;
  }

  .stat-val {
    font-size: 28px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    line-height: 1.2;
  }

  .stat-lbl {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }

  /* 图表头部 */
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sec-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .chart-container {
    width: 100%;
    height: 320px;
  }

  /* 分类统计小字显示 */
  .type-stats-mini {
    display: flex;
    gap: 16px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);
    flex-wrap: wrap;
  }

  .type-stat-mini {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex: 1;
    min-width: 60px;
  }

  .type-count-mini {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1;
  }

  .type-label-mini {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  /* 番剧链接 */
  .anime-link {
    color: var(--el-color-primary);
    text-decoration: none;
    cursor: pointer;
    transition: color 0.2s;
  }

  .anime-link:hover {
    color: var(--el-color-primary-light-3);
    text-decoration: underline;
  }
</style>
