import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/components/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据概览' }
      },
      {
        path: 'anime',
        name: 'AnimeList',
        component: () => import('@/views/AnimeList.vue'),
        meta: { title: '番剧管理' }
      },
      {
        path: 'site-users',
        name: 'SiteUserManagement',
        component: () => import('@/views/SiteUserManagement.vue'),
        meta: { title: '网站用户' }
      },
      {
        path: 'search',
        name: 'SearchStats',
        component: () => import('@/views/SearchStats.vue'),
        meta: { title: '搜索统计' }
      },
      {
        path: 'app-versions',
        name: 'AppVersionManagement',
        component: () => import('@/views/AppVersionManagement.vue'),
        meta: { title: 'App版本管理' }
      },
      {
        path: 'carousels',
        name: 'CarouselManagement',
        component: () => import('@/views/CarouselManagement.vue'),
        meta: { title: '轮播图管理' }
      },
      {
        path: 'ads',
        name: 'AdManagement',
        component: () => import('@/views/AdManagement.vue'),
        meta: { title: '广告管理' }
      },
      {
        path: 'ad-positions',
        name: 'AdPositionManagement',
        component: () => import('@/views/AdPositionManagement.vue'),
        meta: { title: '广告位管理' }
      },
      {
        path: 'crawler',
        name: 'Crawler',
        component: () => import('@/views/Crawler.vue'),
        meta: { title: '爬虫控制' }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/UserManagement.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'tasks',
        name: 'TaskManager',
        component: () => import('@/views/TaskManager.vue'),
        meta: { title: '定时任务' }
      },
      {
        path: 'task-logs',
        name: 'TaskLogs',
        component: () => import('@/views/TaskLogs.vue'),
        meta: { title: '执行记录' }
      },
      {
        path: 'crawler-progress',
        name: 'CrawlerProgress',
        component: () => import('@/views/CrawlerProgress.vue'),
        meta: { title: '爬虫进度监控' }
      },
      {
        path: 'access-user-detail',
        name: 'AccessUserDetail',
        component: () => import('@/views/AccessUserDetail.vue'),
        meta: { title: '访问用户分析' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 权限校验
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('ms_token')

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 动漫天堂管理后台`
  }

  // 需要认证但未登录
  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  }
  // 已登录访问登录页，重定向到首页
  else if (to.path === '/login' && token) {
    next('/dashboard')
  }
  // 正常访问
  else {
    next()
  }
})

export default router
