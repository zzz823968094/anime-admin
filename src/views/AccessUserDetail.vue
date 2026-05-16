<template>
  <div class="access-user-detail">
    <!-- 留存率分析卡片 -->
    <div class="card">
      <div class="chart-header">
        <h2 class="sec-title tile-heading">
          <svg
            style="width: 24px; height: 24px; margin-right: 8px; vertical-align: middle"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
          </svg>
          用户留存率分析
        </h2>
        <input
          v-model="selectedDate"
          type="date"
          :max="maxDate"
          class="ctrl"
          style="width: 180px"
          @change="handleDateChange"
        />
      </div>

      <div v-if="loadingRetention" class="loading-text">加载中...</div>
      <div
        v-else-if="!retentionData || Object.keys(retentionData).length === 0"
        class="loading-text"
      >
        暂无留存数据
      </div>
      <div v-else class="retention-grid">
        <div v-for="(rate, days) in retentionData" :key="days" class="stat-card retention-item">
          <div>
            <div class="stat-lbl caption">{{ days }}天留存</div>
            <div class="stat-val display-hero" :class="getRateClass(rate)">
              {{ rate.toFixed(2) }}%
            </div>
          </div>
          <div class="progress-bar-container">
            <div
              class="progress-bar-fill"
              :style="{ width: rate + '%', backgroundColor: getProgressColor(rate) }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 地理位置统计卡片 -->
    <div class="card">
      <div class="chart-header">
        <h2 class="sec-title tile-heading">
          <svg
            style="width: 24px; height: 24px; margin-right: 8px; vertical-align: middle"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path
              d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
            />
          </svg>
          地理位置分布
        </h2>
        <div class="chart-controls">
          <select
            v-model="locationDays"
            class="ctrl"
            style="width: 120px"
            @change="loadLocationStats"
          >
            <option :value="7">7天</option>
            <option :value="30">30天</option>
            <option :value="90">90天</option>
            <option :value="180">180天</option>
          </select>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="updatingLocation"
            @click="handleUpdateLocation"
          >
            {{ updatingLocation ? '更新中...' : '更新IP地理位置' }}
          </button>
        </div>
      </div>

      <div v-if="loadingLocation" class="loading-text">加载中...</div>
      <div v-else-if="!locationData || locationData.length === 0" class="loading-text">
        暂无地理位置数据
      </div>
      <div v-else>
        <!-- 图表可视化区域 - 始终挂载但通过 v-show 控制 -->
        <div
          v-show="!loadingLocation && locationData.length > 0"
          ref="mapContainer"
          class="chart-container"
        />

        <!-- 地理位置表格 -->
        <table class="tbl" style="margin-top: 24px">
          <thead>
            <tr>
              <th>国家</th>
              <th>省份</th>
              <th>城市</th>
              <th style="cursor: pointer" @click="sortBy('ipCount')">IP数</th>
              <th>占比</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in sortedLocationData" :key="index">
              <td>{{ row.country }}</td>
              <td>{{ row.province }}</td>
              <td>{{ row.city }}</td>
              <td>{{ row.ipCount }}</td>
              <td>
                <div class="progress-bar-container" style="height: 6px">
                  <div
                    class="progress-bar-fill"
                    :style="{
                      width: getLocationPercentage(row.ipCount) + '%',
                      backgroundColor: '#0071e3'
                    }"
                  />
                </div>
                <span class="caption" style="margin-top: 4px; display: block">
                  {{ getLocationPercentage(row.ipCount) }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
  import * as echarts from 'echarts'
  import { getRetentionRate, getLocationStats, updateLocation } from '@/api/accessUserDetail'

  // ==================== 留存率相关 ====================

  /** 选中的基准日期 */
  const selectedDate = ref('')

  /** 最大可选日期（今天） */
  const maxDate = computed(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  /** 留存率加载状态 */
  const loadingRetention = ref(false)

  /** 留存率数据 */
  const retentionData = ref({})

  /**
   * 日期改变时重新加载留存率数据
   */
  const handleDateChange = () => {
    if (selectedDate.value) {
      // 将 YYYY-MM-DD 格式转换为 YYYYMMDD 格式
      const formattedDate = selectedDate.value.replace(/-/g, '')
      loadRetentionRate(formattedDate)
    }
  }

  /**
   * 获取留存率数据
   * @param {string} baseDate - 基准日期 YYYYMMDD
   */
  const loadRetentionRate = async (baseDate) => {
    try {
      loadingRetention.value = true
      const res = await getRetentionRate({ baseDate })

      if (res.code === 200 && res.data) {
        retentionData.value = res.data
      } else {
        showToast('获取留存率数据失败', 'warning')
      }
    } catch (error) {
      console.error('加载留存率失败:', error)
      showToast('加载留存率数据失败', 'error')
    } finally {
      loadingRetention.value = false
    }
  }

  /**
   * 根据留存率获取样式类
   * @param {number} rate - 留存率
   * @returns {string} 样式类名
   */
  const getRateClass = (rate) => {
    if (rate >= 50) {
      return 'rate-excellent'
    }
    if (rate >= 30) {
      return 'rate-good'
    }
    if (rate >= 10) {
      return 'rate-normal'
    }
    return 'rate-poor'
  }

  /**
   * 根据留存率获取进度条颜色
   * @param {number} rate - 留存率
   * @returns {string} 颜色值
   */
  const getProgressColor = (rate) => {
    if (rate >= 50) {
      return '#67c23a'
    }
    if (rate >= 30) {
      return '#409eff'
    }
    if (rate >= 10) {
      return '#e6a23c'
    }
    return '#f56c6c'
  }

  // ==================== 地理位置相关 ====================

  /** 地理位置统计天数 */
  const locationDays = ref(30)

  /** 地理位置加载状态 */
  const loadingLocation = ref(false)

  /** 地理位置更新状态 */
  const updatingLocation = ref(false)

  /** 地理位置数据 */
  const locationData = ref([])

  /** 地图容器引用 */
  const mapContainer = ref(null)

  /** 地图实例 */
  let mapInstance = null

  /**
   * 获取地理位置统计数据
   */
  const loadLocationStats = async () => {
    try {
      loadingLocation.value = true
      const res = await getLocationStats({ days: locationDays.value })

      if (res.code === 200 && res.data) {
        locationData.value = res.data
        loadingLocation.value = false

        // 等待 DOM 更新
        await nextTick()

        // 延迟渲染以确保 DOM 已挂载且尺寸正确
        setTimeout(() => {
          renderMap()
        }, 300)
      } else {
        showToast('获取地理位置数据失败', 'warning')
        loadingLocation.value = false
      }
    } catch (error) {
      console.error('加载地理位置失败:', error)
      showToast('加载地理位置数据失败', 'error')
      loadingLocation.value = false
    }
  }

  /**
   * 手动更新IP地理位置
   */
  const handleUpdateLocation = async () => {
    try {
      updatingLocation.value = true
      const res = await updateLocation()

      if (res.code === 200) {
        showToast('地理位置更新任务已启动，请稍后查看结果', 'success')
        // 延迟刷新数据
        setTimeout(() => {
          loadLocationStats()
        }, 5000)
      } else {
        showToast(res.message || '更新失败', 'error')
      }
    } catch (error) {
      console.error('更新地理位置失败:', error)
      showToast('更新地理位置失败', 'error')
    } finally {
      updatingLocation.value = false
    }
  }

  /**
   * 计算地理位置占比（基于IP数）
   * @param {number} ipCount - IP数
   * @returns {number} 百分比
   */
  const getLocationPercentage = (ipCount) => {
    if (!locationData.value || locationData.value.length === 0) {
      return 0
    }

    const totalIPs = locationData.value.reduce((sum, item) => sum + (item.ipCount || 0), 0)
    if (totalIPs === 0) {
      return 0
    }

    return ((ipCount / totalIPs) * 100).toFixed(2)
  }

  /** 排序状态 */
  const sortKey = ref('')
  const sortOrder = ref('asc') // 'asc' or 'desc'

  /** 排序后的地理位置数据 */
  const sortedLocationData = computed(() => {
    if (!sortKey.value) {
      return locationData.value
    }

    return [...locationData.value].sort((a, b) => {
      const aVal = a[sortKey.value] || 0
      const bVal = b[sortKey.value] || 0
      return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
    })
  })

  /**
   * 排序方法
   * @param {string} key - 排序字段
   */
  const sortBy = (key) => {
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortOrder.value = 'desc'
    }
  }

  /**
   * 显示提示消息
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型
   */
  const showToast = (message, type = 'info') => {
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  /**
   * 渲染图表
   */
  const renderMap = (retryCount = 0) => {
    // 直接通过 DOM 查询获取容器，避开 Vue ref 在条件渲染下的绑定延迟
    const container =
      document.querySelector('.access-user-detail .chart-container') ||
      document.querySelector('.chart-container')

    if (!container) {
      if (retryCount < 15) {
        console.warn(`图表容器未找到，准备重试... ${retryCount + 1}/15`)
        setTimeout(() => renderMap(retryCount + 1), 200)
      } else {
        console.error('图表容器始终未找到，已停止重试。请检查 DOM 结构或 v-if 条件。')
      }
      return
    }

    const containerRect = container.getBoundingClientRect()
    if (containerRect.width === 0 || containerRect.height === 0) {
      if (retryCount < 15) {
        console.warn(`图表容器尺寸为 0，准备重试... ${retryCount + 1}/15`)
        setTimeout(() => renderMap(retryCount + 1), 200)
      }
      return
    }

    // 如果实例不存在，创建新实例
    if (!mapInstance) {
      mapInstance = echarts.init(container)
    }

    // 准备地图数据 -> 转换为堆叠柱状图数据（基于IP数）
    // 1. 提取所有省份和城市
    const provinces = [...new Set(locationData.value.map((item) => item.province))].sort()
    const cityStats = {}

    locationData.value.forEach((item) => {
      const city = item.city || item.province
      if (!cityStats[city]) {
        cityStats[city] = 0
      }
      cityStats[city] += item.ipCount  // 使用 ipCount 而非 userCount
    })

    // 2. 按用户数排序城市，取前 8 个，其余归为“其他”
    const sortedCities = Object.entries(cityStats)
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0])

    const topCities = sortedCities.slice(0, 8)
    const otherCities = sortedCities.slice(8)
    const displayCities = otherCities.length > 0 ? [...topCities, '其他'] : topCities

    // 3. 构建 Series 数据
    const series = displayCities.map((city) => ({
      name: city,
      type: 'bar',
      stack: 'total',
      emphasis: {
        focus: 'series'
      },
      data: provinces.map((prov) => {
        if (city === '其他') {
          // 计算"其他"城市的IP总和
          return locationData.value
            .filter(
              (item) => item.province === prov && otherCities.includes(item.city || item.province)
            )
            .reduce((sum, item) => sum + item.ipCount, 0)
        }
        const item = locationData.value.find(
          (d) => d.province === prov && (d.city || d.province) === city
        )
        return item ? item.ipCount : 0
      })
    }))

    console.log('渲染图表数据:', { provinces, series })

    // ECharts配置 - 使用堆叠柱状图展示地域分布
    const option = {
      title: {
        text: '用户地域分布 (按省份/城市)',
        left: 'center',
        textStyle: {
          color: '#1d1d1f',
          fontSize: 18,
          fontWeight: 600
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        bottom: 0,
        textStyle: {
          color: '#86868b'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: provinces,
        axisLabel: {
          color: '#86868b',
          rotate: 45,
          interval: 0,
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.08)'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'IP数',
        nameTextStyle: {
          color: '#86868b'
        },
        axisLabel: {
          color: '#86868b',
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.08)'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.06)'
          }
        }
      },
      series: series
    }

    mapInstance.setOption(option, true)

    // 确保图表正确显示尺寸
    setTimeout(() => {
      if (mapInstance) {
        mapInstance.resize()
      }
    }, 50)
  }

  /**
   * 窗口resize时重新调整地图大小
   */
  const handleResize = () => {
    if (mapInstance) {
      mapInstance.resize()
    }
  }

  // ==================== 生命周期 ====================

  onMounted(() => {
    // 默认使用昨天的日期（使用 yyyy-MM-dd 格式）
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const year = yesterday.getFullYear()
    const month = String(yesterday.getMonth() + 1).padStart(2, '0')
    const day = String(yesterday.getDate()).padStart(2, '0')
    selectedDate.value = `${year}-${month}-${day}`

    // 加载数据（转换为 YYYYMMDD 格式）
    const baseDate = `${year}${month}${day}`
    loadRetentionRate(baseDate)
    loadLocationStats()

    // 添加窗口resize事件监听
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    // 移除事件监听
    window.removeEventListener('resize', handleResize)

    // 销毁地图实例
    if (mapInstance) {
      mapInstance.dispose()
      mapInstance = null
    }
  })
</script>

<style scoped>
  .access-user-detail {
    padding: 0;
  }

  /* 加载文本 */
  .loading-text {
    text-align: center;
    padding: 40px 0;
    color: var(--secondary);
    font-size: 15px;
  }

  /* 留存率网格 */
  .retention-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .retention-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    transition: all 0.2s ease;
  }

  .retention-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  /* 留存率数值颜色 */
  .rate-excellent {
    color: #34c759;
  }

  .rate-good {
    color: #0071e3;
  }

  .rate-normal {
    color: #ff9500;
  }

  .rate-poor {
    color: #ff3b30;
  }

  /* 进度条容器 */
  .progress-bar-container {
    width: 100%;
    height: 8px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  /* 图表容器 */
  .chart-container {
    width: 100%;
    height: 500px;
    margin-top: 20px;
  }

  /* 图表头部 */
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .chart-controls {
    display: flex;
    gap: 12px;
    align-items: center;
  }
</style>
