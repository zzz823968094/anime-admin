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
          :class="{ on: currentRoute === 'dashboard' }"
          @click="navigate('dashboard')"
        >
          <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <span>数据概览</span>
        </button>
        <div class="sb-section">内容管理</div>

        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'carousels' }"
          @click="navigate('carousels')"
        >
          <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>
          <span>轮播图管理</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'ads' }"
          @click="navigate('ads')"
        >
          <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"></path><path d="m12 12 4 10 1.7-4.3L22 16Z"></path></svg>
          <span>广告管理</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'ad-positions' }"
          @click="navigate('ad-positions')"
        >
          <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>广告位管理</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'anime' }"
          @click="navigate('anime')"
        >
          <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
          <span>番剧管理</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'site-users' }"
          @click="navigate('site-users')"
        >
          <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>网站用户</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'search' }"
          @click="navigate('search')"
        >
          <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span>搜索统计</span>
        </button>
        <button
            class="sb-item body-text"
            :class="{ on: currentRoute === 'app-versions' }"
            @click="navigate('app-versions')"
        >
          <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
          <span>App 版本</span>
        </button>
        <div class="sb-section">系统</div>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'users' }"
          @click="navigate('users')"
        >
          <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span>用户管理</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'crawler' }"
          @click="navigate('crawler')"
        >
          <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          <span>爬虫控制</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'tasks' }"
          @click="navigate('tasks')"
        >
          <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>定时任务</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'task-logs' }"
          @click="navigate('task-logs')"
        >
          <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>执行记录</span>
        </button>
        <button
          class="sb-item body-text"
          :class="{ on: currentRoute === 'crawler-progress' }"
          @click="navigate('crawler-progress')"
        >
          <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          <span>爬虫进度监控</span>
        </button>
      </nav>
      <div class="sb-bottom">
        <button class="sb-logout" @click="handleLogout">
          <svg width="18px" height="18px" class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
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
      </header>

      <!-- 主内容区 -->
      <main class="main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const currentRoute = computed(() => route.name)

// 获取当前路由的中文名称用于 Header 显示
const currentRouteName = computed(() => {
  const nameMap = {
    'dashboard': '数据概览',
    'carousels': '轮播图管理',
    'ads': '广告管理',
    'ad-positions': '广告位管理',
    'anime': '番剧管理',
    'site-users': '网站用户',
    'search': '搜索统计',
    'app-versions': 'App 版本',
    'users': '用户管理',
    'crawler': '爬虫控制',
    'tasks': '定时任务',
    'task-logs': '执行记录',
    'crawler-progress': '爬虫进度监控'
  }
  return nameMap[route.name] || '管理后台'
})

const navigate = (name) => {
  router.push({ name })
}

const handleLogout = () => {
  localStorage.removeItem('ms_token')
  router.push('/login')
}
</script>
