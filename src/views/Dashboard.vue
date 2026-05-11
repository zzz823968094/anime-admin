<template>
  <div>
    <div class="page-hd">
      <div class="page-title">数据概览</div>
    </div>

    <!-- 系统更新状态卡片 -->
    <div class="card system-update-card">
      <div class="update-header">
        <div class="update-title">
          <span class="update-icon">🔧</span>
          <span>系统维护模式</span>
        </div>
        <div class="update-status-badge" :class="systemUpdate.updating ? 'status-on' : 'status-off'">
          {{ systemUpdate.updating ? '维护中' : '正常运行' }}
        </div>
      </div>
      <div class="update-content">
        <div class="update-info">
          <div class="info-item">
            <span class="info-label">当前状态：</span>
            <span class="info-value" :class="systemUpdate.updating ? 'text-warning' : 'text-success'">
              {{ systemUpdate.updating ? '系统正在维护升级' : '系统正常运行' }}
            </span>
          </div>
          <div class="info-item" v-if="systemUpdate.message">
            <span class="info-label">提示信息：</span>
            <span class="info-value text-sub">{{ systemUpdate.message }}</span>
          </div>
        </div>
        <div class="update-actions">
          <button 
            class="btn-toggle" 
            :class="systemUpdate.updating ? 'btn-resume' : 'btn-maintenance'"
            @click="handleToggleUpdate"
            :disabled="loadingUpdate"
          >
            {{ loadingUpdate ? '处理中...' : (systemUpdate.updating ? '恢复服务' : '开启维护') }}
          </button>
          <button 
            class="btn-edit-message"
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
        <div class="stat-ic ic-purple">📺</div>
        <div>
          <div class="stat-val">{{ stats.totalAnime || '0' }}</div>
          <div class="stat-lbl">番剧总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-ic ic-green">👥</div>
        <div>
          <div class="stat-val">{{ stats.totalUser || '0' }}</div>
          <div class="stat-lbl">注册用户</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-ic ic-orange">今日</div>
        <div>
          <div class="stat-val">{{ stats.todayView || '0' }}</div>
          <div class="stat-lbl">今日播放量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-ic ic-orange">ALL</div>
        <div>
          <div class="stat-val">{{ stats.totalView || '0' }}</div>
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

    <!-- 设备统计排名 -->
    <div class="card">
      <div class="chart-header">
        <div class="sec-title">📱 设备型号统计排名</div>
        <div class="chart-controls">
          <button
              v-for="days in [7, 30, 90]"
              :key="days"
              :class="['time-btn', { active: deviceSelectedDays === days }]"
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
      <div class="sec-title">最新入库番剧</div>
      <table class="tbl">
        <thead>
        <tr>
          <th>ID</th>
          <th>标题</th>
          <th>分类</th>
          <th>集数</th>
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
          <td style="color:var(--sub)">{{ (anime.createAt || '').slice(0, 10) }}</td>
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
      {icon: '🇯🇵', label: '日韩动漫', count: (s.jpCount || 0).toLocaleString()},
      {icon: '🌎', label: '欧美动漫', count: (s.usCount || 0).toLocaleString()},
      {icon: '🇨🇳', label: '中文动漫', count: (s.cnCount || 0).toLocaleString()},
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
/* 系统更新状态卡片样式 */
.system-update-card {
  margin-bottom: 20px;
  border: 2px solid var(--border);
  transition: all 0.3s ease;
}

.system-update-card:has(.status-on) {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.update-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.update-icon {
  font-size: 20px;
}

.update-status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.update-status-badge.status-on {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: #000;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.update-status-badge.status-off {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
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
  margin-bottom: 10px;
  font-size: 14px;
}

.info-label {
  color: var(--sub);
  margin-right: 8px;
}

.info-value {
  color: #fff;
  font-weight: 500;
}

.text-warning {
  color: #f59e0b;
}

.text-success {
  color: #10b981;
}

.text-sub {
  color: var(--sub);
}

.update-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.btn-toggle,
.btn-edit-message {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.btn-toggle:disabled,
.btn-edit-message:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-maintenance {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn-maintenance:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-resume {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-resume:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-edit-message {
  background: var(--bg3);
  color: var(--accent);
  border: 1px solid var(--accent);
}

.btn-edit-message:hover:not(:disabled) {
  background: rgba(124, 106, 247, 0.1);
  transform: translateY(-2px);
}

/* 模态框样式 */
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #fff;
}

.modal-close {
  background: none;
  border: none;
  color: var(--sub);
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: var(--bg3);
  color: #fff;
}

.modal-body {
  padding: 20px;
}

.message-textarea {
  width: 100%;
  padding: 12px;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
}

.message-textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

.btn-cancel,
.btn-confirm {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: var(--bg3);
  color: var(--sub);
  border: 1px solid var(--border);
}

.btn-cancel:hover {
  background: var(--border);
  color: #fff;
}

.btn-confirm {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #fff;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 106, 247, 0.4);
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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

/* 设备统计样式 */
.device-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-model {
  font-weight: 500;
  color: #fff;
}

.os-badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(124, 106, 247, 0.15);
  border: 1px solid rgba(124, 106, 247, 0.3);
  border-radius: 4px;
  font-size: 12px;
  color: var(--accent);
  font-weight: 500;
}

.user-count {
  font-weight: 600;
  color: #fff;
  font-size: 14px;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 13px;
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #000;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #000;
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #e6a57e);
  color: #fff;
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.4);
}

.rank-normal {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--sub);
}

.percentage-bar {
  position: relative;
  width: 100%;
  height: 24px;
  background: var(--bg3);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.percentage-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  transition: width 0.3s ease;
  min-width: 2px;
}

.percentage-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.device-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-top: 16px;
  background: var(--bg3);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-label {
  font-size: 13px;
  color: var(--sub);
}

.summary-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent);
}
</style>
