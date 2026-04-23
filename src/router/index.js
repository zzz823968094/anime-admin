import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据概览' }
      },
      {
        path: 'anime',
        name: 'anime',
        component: () => import('@/views/AnimeList.vue'),
        meta: { title: '番剧管理' }
      },
      {
        path: 'site-users',
        name: 'site-users',
        component: () => import('@/views/SiteUserManagement.vue'),
        meta: { title: '网站用户' }
      },
      {
        path: 'search',
        name: 'search',
        component: () => import('@/views/SearchStats.vue'),
        meta: { title: '搜索统计' }
      },
      {
        path: 'app-versions',
        name: 'app-versions',
        component: () => import('@/views/AppVersionManagement.vue'),
        meta: { title: 'App 版本管理' }
      },
      {
        path: 'carousels',
        name: 'carousels',
        component: () => import('@/views/CarouselManagement.vue'),
        meta: { title: '轮播图管理' }
      },
      {
        path: 'crawler',
        name: 'crawler',
        component: () => import('@/views/Crawler.vue'),
        meta: { title: '爬虫控制' }
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/UserManagement.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'tasks',
        name: 'tasks',
        component: () => import('@/views/TaskManager.vue'),
        meta: { title: '定时任务' }
      },
      {
        path: 'task-logs',
        name: 'task-logs',
        component: () => import('@/views/TaskLogs.vue'),
        meta: { title: '执行记录' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('ms_token')
  
  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
