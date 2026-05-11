<template>
  <div class="dashboard-content">
    <!-- 系统更新状态卡片 -->
    <div class="card system-update-card">
      <div class="update-header">
        <div class="update-title sec-title">
          <svg class="update-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
          <span>系统维护模式</span>
        </div>
        <div class="update-status-badge caption" :class="systemUpdate.updating ? 'status-on' : 'status-off'">
          {{ systemUpdate.updating ? '维护中' : '正常运行' }}
        </div>
      </div>
      <div class="update-content">
        <div class="update-info">
          <div class="info-item body-text">
            <span class="info-label caption">当前状态：</span>
            <span class="info-value body-text" :class="systemUpdate.updating ? 'text-warning' : 'text-success'">
              {{ systemUpdate.updating ? '系统正在维护升级' : '系统正常运行' }}
            </span>
          </div>
          <div class="info-item body-text" v-if="systemUpdate.message">
            <span class="info-label caption">提示信息：</span>
            <span class="info-value text-sub caption">{{ systemUpdate.message }}</span>
          </div>
        </div>
        <div class="update-actions">
          <button 
            class="btn btn-primary" 
            :class="systemUpdate.updating ? 'btn-resume' : 'btn-maintenance'"
            @click="handleToggleUpdate"
            :disabled="loadingUpdate"
          >
            {{ loadingUpdate ? '处理中...' : (systemUpdate.updating ? '恢复服务' : '开启维护') }}
          </button>
          <button 
            class="btn btn-ghost"
            @click="showEditMessage = true"
            :disabled="loadingUpdate"
          >
            编辑提示
          </button>
        </div>
      </div>
      <!-- 编辑提示信息对话框 -->
      <div v-if="showEditMessage" class="modal-overlay" @click="showEditMessage = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>编辑维护提示信息</h3>
            <button class="modal-close" @click="showEditMessage = false">×</button>
          </div>
          <div class="modal-body">
            <textarea 
              v-model="editMessage" 
              placeholder="请输入维护提示信息..."
              rows="4"
              class="message-textarea"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showEditMessage = false">取消</button>
            <button class="btn-confirm" @click="handleUpdateMessage" :disabled="loadingUpdate">
              {{ loadingUpdate ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <svg class="stat-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
        <div>
          <div class="stat-val display-hero">{{ stats.totalAnime || '0' }}</div>
          <div class="stat-lbl caption">番剧总数</div>
        </div>
      </div>
      <div class="stat-card">
        <svg class="stat-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        <div>
          <div class="stat-val display-hero">{{ stats.totalUser || '0' }}</div>
          <div class="stat-lbl caption">注册用户</div>
        </div>
      </div>
      <div class="stat-card">
        <svg class="stat-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <div>
          <div class="stat-val display-hero">{{ stats.todayView || '0' }}</div>
          <div class="stat-lbl caption">今日播放量</div>
        </div>
      </div>
      <div class="stat-card">
        <svg class="stat-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
        <div>
          <div class="stat-val display-hero">{{ stats.totalView || '0' }}</div>
          <div class="stat-lbl caption">总播放量</div>
        </div>
      </div>
    </div>

    <div class="stats-grid">

      <div class="stat-card">
        <svg class="stat-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
        <div>
          <div class="stat-val display-hero">{{ accessData.todayAppUV || '—' }}</div>
          <div class="stat-lbl caption">今日App访问人数</div>
        </div>
      </div>
      <div class="stat-card">
        <svg class="stat-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
        <div>
          <div class="stat-val display-hero">{{ accessData.todayWebUV === null ? '—' : accessData.todayWebUV }}</div>
          <div class="stat-lbl caption">今日Web访问人数</div>
        </div>
      </div>

      <div class="stat-card">
        <svg class="stat-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        <div>
          <div class="stat-val display-hero">{{ accessData.totalUserCount || '—' }}</div>
          <div class="stat-lbl caption">(总)访问人数</div>
        </div>
      </div>
    </div>
    <!-- 七天日活折线图 -->
    <div class="card">
      <div class="chart-header">
        <h2 class="sec-title tile-heading">日活趋势</h2>
        <div class="chart-controls">
          <button
              v-for="days in [7, 30, 90, 180]"
              :key="days"
              :class="['btn btn-filter caption', { active: selectedDays === days }]"
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
      <h2 class="sec-title tile-heading">分类统计</h2>
      <div class="type-stats-grid">
        <div v-for="item in typeStats" :key="item.label" class="type-stat-card">
          <div class="type-icon">
            <svg v-if="item.type === 'jp'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"></path></svg>
            <svg v-else-if="item.type === 'us'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <svg v-else-if="item.type === 'cn'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            <svg v-else-if="item.type === 'all'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </div>
          <div class="type-count display-hero">{{ item.count }}</div>
          <div class="type-label caption">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <!-- 设备统计排名 -->
    <div class="card">
      <div class="chart-header">
        <h2 class="sec-title tile-heading">
          <svg style="width: 24px; height: 24px; margin-right: 8px; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
          设备型号统计排名
        </h2>
        <div class="chart-controls">
          <button
              v-for="days in [7, 30, 90]"
              :key="days"
              :class="['btn btn-filter caption', { active: deviceSelectedDays === days }]"
              @click="changeDeviceTimeRange(days)"
          >
            {{ days }}天
          </button>
        </div>
      </div>
      <div v-if="loadingDevice" class="loading-text">加载中...</div>
      <div v-else-if="!deviceData.trend || deviceData.trend.length === 0" class="loading-text">暂无设备数据</div>
      <div v-else>
        <table class="tbl">
          <thead>
          <tr>
            <th style="width: 60px;">排名</th>
            <th>设备型号</th>
            <th>操作系统</th>
            <th style="width: 120px;">访问人数</th>
            <th style="width: 150px;">占比</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(device, index) in topDevices" :key="index">
            <td>
              <span :class="['rank-badge', getRankClass(index)]">{{ index + 1 }}</span>
            </td>
            <td>
              <div class="device-info">
                <span class="device-model">{{ device.deviceModel }}</span>
              </div>
            </td>
            <td>
              <span class="os-badge">{{ device.os }}</span>
            </td>
            <td>
              <span class="user-count">{{ device.userCount?.toLocaleString() || 0 }}</span>
            </td>
            <td>
              <div class="percentage-bar">
                <div 
                  class="percentage-fill" 
                  :style="{ width: getPercentage(device.userCount) + '%' }"
                ></div>
                <span class="percentage-text">{{ getPercentage(device.userCount).toFixed(2) }}%</span>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
        <div class="device-summary">
          <div class="summary-item">
            <span class="summary-label">总访问人数：</span>
            <span class="summary-value">{{ deviceData.totalUserCount?.toLocaleString() || 0 }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">设备类型数：</span>
            <span class="summary-value">{{ deviceData.trend?.length || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 最新入库番剧 -->
    <div class="card">
      <h2 class="sec-title tile-heading">最新入库番剧</h2>
      <table class="tbl">
        <thead>
        <tr>
          <th class="caption">ID</th>
          <th class="caption">标题</th>
          <th class="caption">分类</th>
          <th class="caption">集数</th>
          <th class="caption">入库时间</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="recentAnime.length === 0">
          <td colspan="6" style="text-align:center;padding:30px;color:var(--sub)" class="body-text">加载中…</td>
        </tr>
        <tr v-for="anime in recentAnime" :key="anime.id">
          <td style="color:var(--sub)" class="caption">{{ anime.id }}</td>
          <td class="body-text">
            {{ anime.vodName }}
          </td>
          <td class="body-text">{{ TYPE_MAP[anime.typeId] || anime.typeId || '—' }}</td>
          <td class="body-text">第 {{ anime.vodTotal }} 集</td>
          <td style="color:var(--sub)" class="caption">{{ (anime.createAt || '').slice(0, 10) }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, nextTick, onUnmounted, computed} from 'vue'
import {useRouter} from 'vue-router'
import {getAnimeStats, getUserCount, getAnimeList, getAccessStats, getDeviceStats, getSystemUpdateStatus, setSystemUpdateStatus, toggleSystemUpdate} from '@/utils/api'
import * as echarts from 'echarts'

const router = useRouter()

const TYPE_MAP = {'67': '🇯🇵 日韩', '68': '🌎 欧美', '66': '🇨🇳 中文'}
const STATUS_MAP = {0: ['连载中', 'b-green'], 1: ['已完结', 'b-blue'], 2: ['已下线', 'b-red']}

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

// 设备统计相关
const loadingDevice = ref(false)
const deviceSelectedDays = ref(7)
const deviceData = reactive({
  totalUserCount: 0,
  trend: [],
  rawTrend: [] // 保存原始数据
})


const loadStats = async () => {
  try {
    const res = await getAnimeStats()
    const s = res.data
    stats.totalAnime = (s.totalAnime || 0).toLocaleString()
    stats.totalView = (s.totalView || 0).toLocaleString()
    stats.todayView = (s.todayView || 0).toLocaleString()
    typeStats.value = [
      {type: 'jp', label: '日韩动漫', count: (s.jpCount || 0).toLocaleString()},
      {type: 'us', label: '欧美动漫', count: (s.usCount || 0).toLocaleString()},
      {type: 'cn', label: '中文动漫', count: (s.cnCount || 0).toLocaleString()},
      {type: 'all', label: '全部', count: (s.totalAnime || 0).toLocaleString()}
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

const loadRecentAnime = async () => {
  try {
    const res = await getAnimeList({page: 1, size: 10, sort: 'latest'})
    recentAnime.value = res.data.records || []
  } catch (e) {
    console.error('加载最新番剧失败', e)
  }
}

const loadAccessStats = async (days) => {
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
  } catch (e) {
    console.error('加载访问统计失败', e)
  } finally {
    loadingAccess.value = false
  }
}

// 切换时间范围
const changeTimeRange = (days) => {
  selectedDays.value = days
  loadAccessStats(days)
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

// 计算排名前10的设备
const topDevices = computed(() => {
  if (!deviceData.trend || deviceData.trend.length === 0) {
    return []
  }
  
  // 按访问人数排序，取前10
  const sorted = [...deviceData.trend].sort((a, b) => (b.userCount || 0) - (a.userCount || 0))
  return sorted.slice(0, 10)
})

// 获取排名样式类
const getRankClass = (index) => {
  if (index === 0) return 'rank-1'
  if (index === 1) return 'rank-2'
  if (index === 2) return 'rank-3'
  return 'rank-normal'
}

// 计算百分比
const getPercentage = (userCount) => {
  if (!deviceData.totalUserCount || deviceData.totalUserCount === 0) {
    return 0
  }
  return ((userCount || 0) / deviceData.totalUserCount) * 100
}

// 切换设备统计时间范围
const changeDeviceTimeRange = async (days) => {
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
  } catch (e) {
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
  } catch (e) {
    console.error('加载系统更新状态失败', e)
  }
}

// 切换系统更新状态
const handleToggleUpdate = async () => {
  try {
    loadingUpdate.value = true
    const res = await toggleSystemUpdate()
    if (res.code === 200) {
      // 重新加载状态
      await loadSystemUpdateStatus()
      alert(res.message || '操作成功')
    }
  } catch (e) {
    console.error('切换系统更新状态失败', e)
    alert('操作失败：' + (e.response?.data?.message || e.message))
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
      alert('提示信息已更新')
    }
  } catch (e) {
    console.error('更新提示信息失败', e)
    alert('更新失败：' + (e.response?.data?.message || e.message))
  } finally {
    loadingUpdate.value = false
  }
}

onMounted(() => {
  loadStats()
  loadUserCount()
  loadRecentAnime()
  loadAccessStats(7)
  loadDeviceStats() // 加载设备统计
  loadSystemUpdateStatus() // 加载系统更新状态
  
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
/* 图表头部和时间选择器 */
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.chart-controls {
  display: inline-flex;
  gap: 8px;
}

.btn-filter.active {
  background: var(--accent);
  color: #ffffff;
  border-color: var(--accent);
}

.chart-container {
  width: 100%;
  height: 320px;
  position: relative;
}

.dashboard-content {
  /* 容器样式，确保与全局 .main 的内边距协调 */
}

/* 系统更新状态卡片样式 - Apple 浅色风格 */
.system-update-card {
  margin-bottom: 24px;
  background: var(--card);               /* 白色背景 #ffffff */
  color: var(--text);                    /* 主文字 #1d1d1f */
  border-radius: 12px;                   /* 12px 圆角 */
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);  /* 极轻阴影 */
  border: 1px solid var(--border);       /* 细边框 */
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);  /* 使用标准边框色 */
}

.update-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text);                    /* 主文字 #1d1d1f */
  font-size: 18px;
  font-weight: 600;
}

.update-icon {
  width: 24px;
  height: 24px;
  stroke: currentColor;
}

.update-status-badge {
  padding: 6px 16px;
  border-radius: 8px;                    /* 8px 圆角 */
  font-weight: 500;
}

.update-status-badge.status-on {
  background: rgba(255, 149, 0, 0.12);   /* 警告色背景 */
  color: var(--warning);                 /* 警告 #ff9500 */
}

.update-status-badge.status-off {
  background: rgba(52, 199, 89, 0.12);   /* 成功色背景 */
  color: var(--success);                 /* 成功 #34c759 */
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
  color: var(--text);                    /* 主文字 #1d1d1f */
}

.info-label {
  color: var(--secondary);               /* 次要文字 #86868b */
  margin-right: 8px;
}

.info-value {
  color: var(--text);                    /* 主文字 #1d1d1f */
  font-weight: 500;
}

.text-warning {
  color: var(--warning);                 /* 警告 #ff9500 */
}

.text-success {
  color: var(--success);                 /* 成功 #34c759 */
}

.text-sub {
  color: var(--secondary);               /* 次要文字 #86868b */
}

.update-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.btn-resume {
  background: var(--success);            /* 成功色 #34c759 */
  color: #ffffff;
}

.btn-resume:hover:not(:disabled) {
  background: #2db84e;                   /* 稍深绿色 */
}

.btn-maintenance {
  background: var(--accent);             /* 苹果蓝 #0071e3 */
  color: #ffffff;
}

.btn-maintenance:hover:not(:disabled) {
  background: #0077ed;                   /* 稍深蓝色 */
}

/* 模态框样式 - Apple 风格 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);        /* 弱化遮罩 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);           /* 毛玻璃效果 */
}

.modal-content {
  background: var(--card);               /* 白色背景 */
  border: 1px solid var(--border);       /* 细边框 */
  border-radius: 28px;                   /* 28px 圆角 */
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);  /* 柔和阴影 */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;                    /* 加大内边距 */
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);                    /* 主文字 #1d1d1f */
  letter-spacing: -0.2px;
}

.modal-close {
  background: rgba(0, 0, 0, 0.06);
  border: none;
  color: var(--secondary);               /* 次要文字 #86868b */
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--text);
}

.modal-body {
  padding: 28px;                         /* 加大内边距 */
}

.message-textarea {
  width: 100%;
  padding: 12px 14px;
  background: var(--bg);                 /* 浅灰背景 #f5f5f7 */
  border: 1px solid var(--border);
  border-radius: 8px;                    /* 8px 圆角 */
  color: var(--text);                    /* 主文字 #1d1d1f */
  font-size: 15px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
  line-height: 1.47;
}

.message-textarea:focus {
  outline: none;
  border-color: var(--accent);           /* 聚焦高亮苹果蓝 */
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.08);
}

.message-textarea::placeholder {
  color: var(--secondary);               /* 占位符文字 #86868b */
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;                    /* 加大内边距 */
  border-top: 1px solid var(--border);
}

.btn-cancel,
.btn-confirm {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;                    /* 8px 圆角 */
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-cancel {
  background: #f5f5f7;                   /* 次按钮背景 */
  color: var(--text);                    /* 主文字 #1d1d1f */
}

.btn-cancel:hover {
  background: #e8e8ed;
}

.btn-confirm {
  background: var(--accent);             /* 主按钮 #0071e3 */
  color: #ffffff;
}

.btn-confirm:hover:not(:disabled) {
  background: #0077ed;
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.type-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 大屏默认 4 列 */
  gap: 20px;
}

/* 响应式适配 - Apple 管理端规范 */
@media (max-width: 1199px) {
  .stats-grid,
  .type-stats-grid {
    grid-template-columns: repeat(3, 1fr); /* 中屏 3 列 */
  }
}

@media (max-width: 833px) {
  .stats-grid,
  .type-stats-grid {
    grid-template-columns: repeat(2, 1fr); /* 平板 2 列 */
  }
}

@media (max-width: 639px) {
  .stats-grid,
  .type-stats-grid {
    grid-template-columns: 1fr; /* 移动端单列 */
  }
}

.type-stat-card {
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 12px;                 /* Apple 规范 12px 圆角 */
  padding: 28px;                       /* 加大内边距 */
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);  /* Apple 风格轻微阴影 */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.type-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.type-icon {
  width: 24px;
  height: 24px;
  margin: 0 auto 12px;
  stroke: #1d1d1f;                     /* 常规状态主色 #1d1d1f */
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-icon svg {
  width: 100%;
  height: 100%;
}

.type-count {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: var(--text);                  /* 主文字 #1d1d1f */
  letter-spacing: -0.2px;
  line-height: 1.1;
}

.type-label {
  font-size: 13px;
  color: var(--secondary);             /* 次要文字 #86868b */
  margin-top: 8px;
}

.anime-link {
  color: var(--apple-blue);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.anime-link:hover {
  color: #0077ed;
  text-decoration: underline;
}

.loading-text {
  color: var(--secondary);             /* 次要文字 #86868b */
  font-size: 15px;
  text-align: center;
  align-self: center;
  padding: 40px 0;
}

/* 排名徽章样式 - 禁止渐变背景 */
.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;                  /* 8px 圆角 */
  font-size: 13px;
  font-weight: 600;
}

.rank-1 {
  background: rgba(245, 158, 11, 0.2);  /* 金色 */
  color: var(--gold);
}

.rank-2 {
  background: rgba(156, 163, 175, 0.2);  /* 银色 */
  color: #9ca3af;
}

.rank-3 {
  background: rgba(180, 120, 60, 0.2);   /* 铜色 */
  color: #b4783c;
}

.rank-normal {
  background: rgba(0, 0, 0, 0.06);
  color: var(--secondary);
}

/* 设备信息样式 */
.device-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.device-model {
  font-weight: 500;
  color: var(--text);
}

.os-badge {
  display: inline-block;
  padding: 3px 10px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 8px;                  /* 8px 圆角 */
  font-size: 12px;
  color: var(--secondary);             /* 次要文字 #86868b */
  font-weight: 500;
}

.user-count {
  font-weight: 600;
  color: var(--text);
}

.percentage-bar {
  position: relative;
  height: 8px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  overflow: hidden;
}

.percentage-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--accent);           /* 禁止渐变，使用纯色 */
  border-radius: 4px;
  transition: width 0.6s ease;
}

.percentage-text {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  font-size: 11px;
  color: var(--secondary);
  font-weight: 500;
}

.device-summary {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.summary-label {
  color: var(--secondary);
}

.summary-value {
  font-weight: 600;
  color: var(--text);
}

.chart-container {
  width: 100%;
  height: 320px;
  position: relative;
}


</style>
