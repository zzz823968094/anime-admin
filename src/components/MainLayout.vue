<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sb-logo">
        <div class="sb-logo-icon">⚙️</div>管理后台
      </div>
      <nav class="sb-menu">
        <div class="sb-section">概览</div>
        <button 
          class="sb-item" 
          :class="{ on: currentRoute === 'dashboard' }"
          @click="navigate('dashboard')"
        >
          <span class="ic">📊</span>数据概览
        </button>
        <div class="sb-section">内容管理</div>
        <button
          class="sb-item"
          :class="{ on: currentRoute === 'anime' }"
          @click="navigate('anime')"
        >
          <span class="ic">🎌</span>番剧管理
        </button>
        <button
          class="sb-item"
          :class="{ on: currentRoute === 'site-users' }"
          @click="navigate('site-users')"
        >
          <span class="ic">👤</span>网站用户
        </button>
        <button
          class="sb-item"
          :class="{ on: currentRoute === 'search' }"
          @click="navigate('search')"
        >
          <span class="ic">🔍</span>搜索统计
        </button>
        <button
            class="sb-item"
            :class="{ on: currentRoute === 'app-versions' }"
            @click="navigate('app-versions')"
        >
          <span class="ic">📱</span>App 版本
        </button>
        <div class="sb-section">系统</div>
        <button
          class="sb-item"
          :class="{ on: currentRoute === 'users' }"
          @click="navigate('users')"
        >
          <span class="ic">👥</span>用户管理
        </button>
        <button
          class="sb-item"
          :class="{ on: currentRoute === 'crawler' }"
          @click="navigate('crawler')"
        >
          <span class="ic">🕷️</span>爬虫控制
        </button>
        <button
          class="sb-item"
          :class="{ on: currentRoute === 'tasks' }"
          @click="navigate('tasks')"
        >
          <span class="ic">⏰</span>定时任务
        </button>
        <button
          class="sb-item"
          :class="{ on: currentRoute === 'task-logs' }"
          @click="navigate('task-logs')"
        >
          <span class="ic">📋</span>执行记录
        </button>
      </nav>
      <div class="sb-bottom">
        <button class="sb-logout" @click="handleLogout">
          <span class="ic">🚪</span>退出登录
        </button>
      </div>
    </aside>

    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const currentRoute = computed(() => route.name)

const navigate = (name) => {
  router.push({ name })
}

const handleLogout = () => {
  localStorage.removeItem('ms_token')
  router.push('/login')
}
</script>
