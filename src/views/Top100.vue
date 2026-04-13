<template>
  <div>
    <div class="page-hd">
      <div class="page-title">🏆 播放量排行 TOP 100</div>
      <button class="btn btn-ghost" @click="loadTop100">🔄 刷新</button>
    </div>

    <div class="card">
      <table class="tbl">
        <thead>
          <tr>
            <th style="width:50px">排名</th>
            <th>番剧</th>
            <th>分类</th>
            <th>集数</th>
            <th>评分</th>
            <th>状态</th>
            <th style="text-align:right">播放量</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="top100List.length === 0">
            <td colspan="7" style="text-align:center;padding:30px;color:var(--sub)">加载中…</td>
          </tr>
          <tr v-for="(anime, index) in top100List" :key="anime.id">
            <td>
              <span :class="['rank-badge', getRankClass(index + 1)]">
                {{ index + 1 }}
              </span>
            </td>
            <td>{{ anime.title }}</td>
            <td>{{ TYPE_MAP[anime.type] || anime.type || '—' }}</td>
            <td>第 {{ anime.currentEpisode }} 集</td>
            <td>{{ anime.score || '—' }}</td>
            <td><span :class="['badge', STATUS_MAP[anime.status]?.[1] || 'b-gray']">{{ STATUS_MAP[anime.status]?.[0] || '未知' }}</span></td>
            <td style="text-align:right;font-weight:600;color:#fff">{{ (anime.viewCount || 0).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTop100 } from '@/utils/api'

const TYPE_MAP = { '25': '🇯🇵 日本', '26': '🌎 欧美', '24': '🇨🇳 中国' }
const STATUS_MAP = { 0: ['已下线', 'b-red'], 1: ['连载中', 'b-green'], 2: ['已完结', 'b-blue'] }

const top100List = ref([])

const getRankClass = (rank) => {
  if (rank === 1) return 'rank-1'
  if (rank === 2) return 'rank-2'
  if (rank === 3) return 'rank-3'
  return 'rank-n'
}

const loadTop100 = async () => {
  try {
    const res = await getTop100()
    top100List.value = res.data || []
  } catch (e) {
    console.error('加载排行榜失败', e)
  }
}

onMounted(() => {
  loadTop100()
})
</script>
