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
      <div class="stat-card">
        <div class="stat-ic ic-pink">👁️</div>
        <div>
          <div class="stat-val">{{ stats.todayUV || '—' }}</div>
          <div class="stat-lbl">今日 UV</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-ic ic-blue">📊</div>
        <div>
          <div class="stat-val">{{ stats.todayPV || '—' }}</div>
          <div class="stat-lbl">今日 PV</div>
        </div>
      </div>
    </div>

    <!-- UV 趋势 -->
    <div class="card">
      <div class="sec-title">访问趋势(近7天 UV)</div>
      <div v-if="uvTrend.length" class="uv-chart">
        <div v-for="item in uvTrend" :key="item.date" class="uv-bar">
          <div class="uv-value">{{ item.uv }}</div>
          <div 
            class="uv-bar-fill" 
            :style="{ height: getBarHeight(item.uv) + 'px' }"
            :title="`${item.date}: ${item.uv} UV`"
          ></div>
          <div class="uv-date">{{ item.date.slice(5) }}</div>
        </div>
      </div>
      <div v-else class="loading-text">加载中…</div>
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
            <td><span :class="['badge', STATUS_MAP[anime.vodIsend]?.[1] || 'b-gray']">{{ STATUS_MAP[anime.vodIsend]?.[0] || '未知' }}</span></td>
            <td style="color:var(--sub)">{{ (anime.createAt || '').slice(0, 10) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {getAnimeStats, getVisitStats, getUserCount, getAnimeList, getVideoCount} from '@/utils/api'

const router = useRouter()

const TYPE_MAP = { '25': '🇯🇵 日本', '26': '🌎 欧美', '24': '🇨🇳 中国' }
const STATUS_MAP = { 0: ['连载中', 'b-green'], 1: ['已完结', 'b-blue'], 2: ['已下线', 'b-red']}

const stats = reactive({
  totalAnime: '—',
  totalVideo: '统计中',
  totalUser: '—',
  totalView: '—',
  todayUV: '—',
  todayPV: '—'
})

const uvTrend = ref([])
const typeStats = ref([])
const recentAnime = ref([])

const getBarHeight = (uv) => {
  if (!uvTrend.value.length) return 4
  const maxUV = Math.max(...uvTrend.value.map(t => t.uv), 1)
  return Math.max(4, Math.round((uv / maxUV) * 72))
}

const loadStats = async () => {
  try {
    const res = await getAnimeStats()
    const s = res.data
    stats.totalAnime = (s.totalAnime || 0).toLocaleString()
    stats.totalView = (s.totalView || 0).toLocaleString()

    typeStats.value = [
      { icon: '🇯🇵', label: '日本动漫', count: (s.jpCount || 0).toLocaleString() },
      { icon: '🌎', label: '欧美动漫', count: (s.usCount || 0).toLocaleString() },
      { icon: '🇨🇳', label: '中国动漫', count: (s.cnCount || 0).toLocaleString() },
      { icon: '📊', label: '全部', count: (s.totalAnime || 0).toLocaleString() }
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

const loadUVStats = async () => {
  try {
    const res = await getVisitStats()
    const s = res.data
    stats.todayUV = (s.todayUV || 0).toLocaleString()
    stats.todayPV = (s.todayPV || 0).toLocaleString()
    uvTrend.value = s.trend || []
  } catch (e) {
    console.error('加载UV统计失败', e)
  }
}

const loadRecentAnime = async () => {
  try {
    const res = await getAnimeList({ page: 1, size: 10, sort: 'latest' })
    recentAnime.value = res.data.records || []
  } catch (e) {
    console.error('加载最新番剧失败', e)
  }
}

onMounted(() => {
  loadStats()
  loadUserCount()
  loadUVStats()
  loadRecentAnime()
  loadVideoCount()
})
</script>

<style scoped>
.uv-chart {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  height: 80px;
  padding: 4px;
}

.uv-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.uv-value {
  font-size: 11px;
  color: var(--text);
  font-weight: 600;
}

.uv-bar-fill {
  width: 100%;
  background: linear-gradient(to top, var(--accent), var(--accent2));
  border-radius: 4px 4px 0 0;
  opacity: 0.8;
  transition: opacity 0.2s;
  cursor: default;
}

.uv-date {
  font-size: 10px;
  color: var(--sub);
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
</style>
