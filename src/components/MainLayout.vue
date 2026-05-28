<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sb-logo">
        <span class="tile-heading">管理后台</span>
      </div>
      <nav class="sb-menu">
        <div class="sb-section">概览</div>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'Dashboard' }"
          @click="navigate('Dashboard')"
        >
          <svg
            class="ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>数据概览</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'AccessUserDetail' }"
          @click="navigate('AccessUserDetail')"
        >
          <svg
            class="ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>用户分析</span>
        </button>
        <div class="sb-section">内容管理</div>

        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'CarouselManagement' }"
          @click="navigate('CarouselManagement')"
        >
          <svg
            class="ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="12" y1="2" x2="12" y2="22" />
          </svg>
          <span>轮播图管理</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'AdManagement' }"
          @click="navigate('AdManagement')"
        >
          <svg
            class="ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
            <path d="m12 12 4 10 1.7-4.3L22 16Z" />
          </svg>
          <span>广告管理</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'AdPositionManagement' }"
          @click="navigate('AdPositionManagement')"
        >
          <svg
            class="ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>广告位管理</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'AnimeList' }"
          @click="navigate('AnimeList')"
        >
          <svg
            class="ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <polygon points="10 8 16 12 10 16 10 8" />
          </svg>
          <span>番剧管理</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'SiteUserManagement' }"
          @click="navigate('SiteUserManagement')"
        >
          <svg
            class="ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>网站用户</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'SearchStats' }"
          @click="navigate('SearchStats')"
        >
          <svg
            class="ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>搜索统计</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'AppVersionManagement' }"
          @click="navigate('AppVersionManagement')"
        >
          <svg
            class="ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          <span>App 版本</span>
        </button>
        <div class="sb-section">系统</div>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'UserManagement' }"
          @click="navigate('UserManagement')"
        >
          <svg
            class="ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>用户管理</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'Crawler' }"
          @click="navigate('Crawler')"
        >
          <svg
            class="ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>爬虫控制</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'TaskManager' }"
          @click="navigate('TaskManager')"
        >
          <svg
            class="ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>定时任务</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'TaskLogs' }"
          @click="navigate('TaskLogs')"
        >
          <svg
            class="ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>执行记录</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'CrawlerProgress' }"
          @click="navigate('CrawlerProgress')"
        >
          <svg
            class="ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span>爬虫进度监控</span>
        </button>
      </nav>
      <div class="sb-bottom">
        <button class="sb-logout" @click="handleLogout">
          <svg
            width="18px"
            height="18px"
            class="ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>退出登录</span>
        </button>
      </div>
    </aside>

    <!-- 右侧主体区域 -->
    <div class="right-panel">
      <!-- 顶部 Header 栏 -->
      <header class="top-header">
        <div class="header-content">
          <span class="header-title">{{ currentRouteName }}</span>
        </div>
        <div class="header-actions">
          <!-- 颜色主题选择器 -->
          <el-select
            v-model="colorTheme"
            placeholder="选择主题色"
            size="small"
            style="width: 120px; margin-right: 8px"
            @change="(val: ColorTheme) => setColorTheme(val)"
          >
            <el-option label="默认蓝" value="" />
            <el-option label="红色" value="theme-red" />
            <el-option label="绿色" value="theme-green" />
            <el-option label="紫色" value="theme-purple" />
            <el-option label="橙色" value="theme-orange" />
          </el-select>
          
          <button
            ref="themeToggleRef"
            class="theme-toggle-btn"
            @click="handleThemeToggle"
            :title="isDark() ? '切换到浅色模式' : '切换到深色模式'"
          >
            <svg
              v-if="isDark()"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <svg
              v-else
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>
      </header>

      <!-- 主内容区 -->
      <main class="main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useTheme, type ColorTheme } from '@/composables/useTheme'

  const route = useRoute()
  const router = useRouter()
  const { theme, colorTheme, toggleThemeWithTransition, setColorTheme, isDark } = useTheme()
  
  // 主题切换按钮的 ref，用于获取点击位置
  const themeToggleRef = ref<HTMLButtonElement | null>(null)

  const currentRoute = computed(() => route.name as string)

  // 获取当前路由的中文名称用于 Header 显示
  const currentRouteName = computed(() => {
    const nameMap: Record<string, string> = {
      Dashboard: '数据概览',
      CarouselManagement: '轮播图管理',
      AdManagement: '广告管理',
      AdPositionManagement: '广告位管理',
      AnimeList: '番剧管理',
      SiteUserManagement: '网站用户',
      SearchStats: '搜索统计',
      AccessUserDetail: '访问用户分析',
      AppVersionManagement: 'App 版本',
      UserManagement: '用户管理',
      Crawler: '爬虫控制',
      TaskManager: '定时任务',
      TaskLogs: '执行记录',
      CrawlerProgress: '爬虫进度监控'
    }
    return nameMap[route.name as string] || '管理后台'
  })

  const navigate = (name: string) => {
    router.push({ name })
  }

  const handleLogout = () => {
    localStorage.removeItem('ms_token')
    router.push('/login')
  }
  
  // 处理主题切换（带动画）
  const handleThemeToggle = (event: MouseEvent) => {
    toggleThemeWithTransition(event)
  }
</script>
