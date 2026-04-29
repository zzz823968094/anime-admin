<template>
  <div>
    <div class="page-hd">
      <div class="page-title">数据概览</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-ic ic-purple">🎌</div>
        <div>
          <div class="stat-val">{{ stats.totalAnime || '—' }}</div>
          <div class="stat-lbl">番剧总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-ic ic-blue">📺</div>
        <div>
          <div class="stat-val">{{ stats.totalVideo || '统计中' }}</div>
          <div class="stat-lbl">视频集数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-ic ic-green">👥</div>
        <div>
          <div class="stat-val">{{ stats.totalUser || '—' }}</div>
          <div class="stat-lbl">注册用户</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-ic ic-orange">▶️</div>
        <div>
          <div class="stat-val">{{ stats.totalView || '—' }}</div>
          <div class="stat-lbl">总播放量</div>
        </div>
      </div>
    </div>

    <div class="stats-grid">

      <div class="stat-card">
        <div class="stat-ic ic-purple">📱</div>
        <div>
          <div class="stat-val">{{ accessData.todayAppUV || '—' }}</div>
          <div class="stat-lbl">今日App访问人数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-ic ic-purple">🖥️</div>
        <div>
          <div class="stat-val">{{ accessData.todayWebUV === null ? '—' : accessData.todayWebUV }}</div>
          <div class="stat-lbl">今日Web访问人数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-ic ic-purple">ALL</div>
        <div>
          <div class="stat-val">{{ accessData.totalUserCount || '—' }}</div>
          <div class="stat-lbl">(总)访问人数</div>
        </div>
      </div>
    </div>
    <!-- 七天日活折线图 -->
    <div class="card">
      <div class="chart-header">
        <div class="sec-title">日活趋势</div>
        <div class="chart-controls">
          <button
              v-for="days in [7, 30, 90, 180]"
              :key="days"
              :class="['time-btn', { active: selectedDays === days }]"
              @click="changeTimeRange(days)"
          >
            {{ days }}天
          </button>
        </div>
      </div>
      <div v-if="loadingAccess" class="loading-text">加载中...</div>
      <div v-else-if="!accessData.trend || accessData.trend.length === 0" class="loading-text">暂无数据</div>
      <div v-else ref="chartContainer" class="chart-container"></div>
    </div>

    <!-- 分类统计 -->
    <div class="card">
      <div class="sec-title">分类统计</div>
      <div class="type-stats-grid">
        <div v-for="type in typeStats" :key="type.label" class="type-stat-card">
          <div class="type-icon">{{ type.icon }}</div>
          <div class="type-count">{{ type.count }}</div>
          <div class="type-label">{{ type.label }}</div>
        </div>
      </div>
    </div>

    <!-- 最新入库番剧 -->
    <div class="card">
      <div class="sec-title">最新入库番剧</div>
      <table class="tbl">
        <thead>
        <tr>
          <th>ID</th>
          <th>标题</th>
          <th>分类</th>
          <th>集数</th>
          <th>状态</th>
          <th>入库时间</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="recentAnime.length === 0">
          <td colspan="6" style="text-align:center;padding:30px;color:var(--sub)">加载中…</td>
        </tr>
        <tr v-for="anime in recentAnime" :key="anime.id">
          <td style="color:var(--sub)">{{ anime.id }}</td>
          <td>
            {{ anime.vodName }}
          </td>
          <td>{{ TYPE_MAP[anime.typeId] || anime.typeId || '—' }}</td>
          <td>第 {{ anime.vodTotal }} 集</td>
          <td><span :class="['badge', STATUS_MAP[anime.vodIsend]?.[1] || 'b-gray']">{{
              STATUS_MAP[anime.vodIsend]?.[0] || '未知'
            }}</span></td>
          <td style="color:var(--sub)">{{ (anime.createAt || '').slice(0, 10) }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, nextTick, onUnmounted} from 'vue'
import {useRouter} from 'vue-router'
import {getAnimeStats, getUserCount, getAnimeList, getVideoCount, getAccessStats} from '@/utils/api'
import * as echarts from 'echarts'

const router = useRouter()

const TYPE_MAP = {'25': '🇯🇵 日本', '26': '🌎 欧美', '24': '🇨🇳 中国'}
const STATUS_MAP = {0: ['连载中', 'b-green'], 1: ['已完结', 'b-blue'], 2: ['已下线', 'b-red']}

const stats = reactive({
  totalAnime: '—',
  totalVideo: '统计中',
  totalUser: '—',
  totalView: '—'
})


const typeStats = ref([])
const recentAnime = ref([])

const loadingAccess = ref(false)
const selectedDays = ref(7)
const accessData = reactive({
  todayAppUV: 0,
  todayWebUV: 0,
  totalUserCount: 0,
  trend: [],
  rawTrend: [] // 保存原始数据
})
const chartContainer = ref(null)
let chartInstance = null


const loadStats = async () => {
  try {
    const res = await getAnimeStats()
    const s = res.data
    stats.totalAnime = (s.totalAnime || 0).toLocaleString()
    stats.totalView = (s.totalView || 0).toLocaleString()

    typeStats.value = [
      {icon: '🇯🇵', label: '日本动漫', count: (s.jpCount || 0).toLocaleString()},
      {icon: '🌎', label: '欧美动漫', count: (s.usCount || 0).toLocaleString()},
      {icon: '🇨🇳', label: '中国动漫', count: (s.cnCount || 0).toLocaleString()},
      {icon: '📊', label: '全部', count: (s.totalAnime || 0).toLocaleString()}
    ]
  } catch (e) {
    console.error('加载统计失败', e)
  }
}

const loadUserCount = async () => {
  try {
    const res = await getUserCount()
    if (res.code === 200) {
      stats.totalUser = res.data
    }
  } catch (e) {
    console.error('加载用户数失败', e)
  }
}

const loadVideoCount = async () => {
  try {
    const res = await getVideoCount()
    if (res.code === 200) {
      stats.totalVideo = res.data
    }
  } catch (e) {
    console.error('加载视频集数失败', e)
  }
}


const loadRecentAnime = async () => {
  try {
    const res = await getAnimeList({page: 1, size: 10, sort: 'latest'})
    recentAnime.value = res.data.records || []
  } catch (e) {
    console.error('加载最新番剧失败', e)
  }
}

const loadAccessStats = async (days = 7) => {
  try {
    loadingAccess.value = true
    const res = await getAccessStats()
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

      // 等待DOM更新后绘制图表
      await nextTick()
      setTimeout(() => {
        drawChart()
      }, 100)
    }
  } catch (e) {
    console.error('加载访问统计失败', e)
  } finally {
    loadingAccess.value = false
  }
}

// 切换时间范围
const changeTimeRange = (days) => {
  selectedDays.value = days
  
  // 根据新的天数重新补全数据
  if (accessData.rawTrend && accessData.rawTrend.length > 0) {
    const completeTrend = fillMissingDates(accessData.rawTrend, days)
    accessData.trend = completeTrend
  }
  
  // 直接重新绘制图表
  setTimeout(() => {
    drawChart()
  }, 50)
}

// 补全缺失日期的数据
const fillMissingDates = (trendData, days) => {
  if (!trendData || trendData.length === 0) {
    // 如果完全没有数据，生成全0的7天数据
    return generateEmptyTrend(days)
  }

  // 获取今天的日期（格式：YYYYMMDD）
  const today = new Date()
  const result = []

  // 创建日期到数据的映射
  const dataMap = new Map()
  trendData.forEach(item => {
    dataMap.set(String(item.date), item)
  })

  // 生成最近N天的完整数据
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateKey = `${year}${month}${day}`

    // 如果该日期有数据则使用，否则填充0
    if (dataMap.has(dateKey)) {
      result.push(dataMap.get(dateKey))
    } else {
      // 生成空数据对象
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
const generateEmptyTrend = (days) => {
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
      appUserCount: 0
    })
  }

  return result
}

// 初始化或更新图表
const drawChart = () => {
  if (!chartContainer.value) {
    return
  }


  // 如果实例不存在，创建新实例
  if (!chartInstance) {
    chartInstance = echarts.init(chartContainer.value)
  }

  // 准备数据（直接使用已补全的数据）
  const trend = accessData.trend.length > 0 ? accessData.trend : generateEmptyTrend(selectedDays.value)
  
  const labels = trend.map(item => {
    const dateStr = String(item.date)
    return `${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`
  })
  const webData = trend.map(item => item.webUserCount || 0)
  const appData = trend.map(item => item.appUserCount || 0)
  

  // 计算最大值
  const allValues = [...webData, ...appData]
  const maxValue = Math.max(...allValues, 1)
  // 根据最大值动态调整Y轴刻度
  let yAxisMax
  if (maxValue <= 10) {
    yAxisMax = 10
  } else if (maxValue <= 50) {
    yAxisMax = 50
  } else if (maxValue <= 100) {
    yAxisMax = 100
  } else {
    yAxisMax = Math.ceil(maxValue / 500) * 500
  }
  

  // ECharts配置
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(26, 27, 30, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: {
        color: '#fff'
      },
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['Web端', 'App端'],
      top: 10,
      left: 'center',
      textStyle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12
      },
      itemWidth: 12,
      itemHeight: 12
    },
    grid: {
      left: 60,
      right: 40,
      top: 50,
      bottom: 60
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 11,
        rotate: labels.length > 15 ? 45 : 0
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      max: yAxisMax,
      axisLine: {
        show: false
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 11,
        formatter: '{value}'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.08)'
        }
      }
    },
    series: [
      {
        name: 'Web端',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        sampling: 'lttb',
        itemStyle: {
          color: '#3b82f6'
        },
        lineStyle: {
          width: 2.5,
          color: '#3b82f6'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(59, 130, 246, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(59, 130, 246, 0.05)'
            }
          ])
        },
        data: webData,
        markPoint: webData.length > 0 ? {
          data: [
            {
              type: 'max',
              name: 'Web峰值',
              itemStyle: {
                color: '#3b82f6'
              },
              label: {
                formatter: '{c}',
                color: '#fff',
                fontSize: 11
              }
            }
          ]
        } : undefined
      },
      {
        name: 'App端',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        sampling: 'lttb',
        itemStyle: {
          color: '#ec4899'
        },
        lineStyle: {
          width: 2.5,
          color: '#ec4899'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(236, 72, 153, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(236, 72, 153, 0.05)'
            }
          ])
        },
        data: appData,
        markPoint: appData.length > 0 ? {
          data: [
            {
              type: 'max',
              name: 'App峰值',
              itemStyle: {
                color: '#ec4899'
              },
              label: {
                formatter: '{c}',
                color: '#fff',
                fontSize: 11
              }
            }
          ]
        } : undefined
      }
    ]
  }

  chartInstance.setOption(option, true)
}

// 窗口resize时重新调整图表大小
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  loadStats()
  loadUserCount()
  loadRecentAnime()
  loadVideoCount()
  loadAccessStats()
  
  // 添加窗口resize事件监听
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('resize', handleResize)
  
  // 销毁图表实例
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.type-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.type-stat-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
  text-align: center;
}

.type-icon {
  font-size: 20px;
  margin-bottom: 6px;
}

.type-count {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

.type-label {
  font-size: 11px;
  color: var(--sub);
  margin-top: 2px;
}

.anime-link {
  color: var(--accent2);
  text-decoration: none;
  cursor: pointer;
}

.anime-link:hover {
  text-decoration: underline;
}

.loading-text {
  color: var(--sub);
  font-size: 13px;
  text-align: center;
  align-self: center;
}

.chart-container {
  width: 100%;
  height: 350px;
  position: relative;
  padding: 10px 0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.time-btn {
  padding: 6px 14px;
  border: 1px solid var(--border);
  background: var(--bg3);
  color: var(--sub);
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.time-btn:hover {
  background: rgba(124, 106, 247, 0.1);
  border-color: var(--accent);
  color: #fff;
}

.time-btn.active {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  border-color: transparent;
  color: #fff;
  font-weight: 600;
}
</style>
