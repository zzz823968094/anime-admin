import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'
import axios from 'axios'
import { getBaseURL } from '@/config/api.config'

// const API_BASE = 'https://lsj.animeparadise.vip'
const API_BASE = getBaseURL()

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('ms_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('ms_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// 通用请求方法
export const get = (url: string, params: Record<string, unknown> = {}) => {
  return api.get(url, { params })
}

export const post = (
  url: string,
  data: Record<string, unknown> = {},
  config: Record<string, unknown> = {}
) => {
  return api.post(url, data, config)
}

export const put = (
  url: string,
  data: Record<string, unknown> = {},
  config: Record<string, unknown> = {}
) => {
  return api.put(url, data, config)
}

export const del = (url: string) => {
  return api.delete(url)
}

// 登录API
export const loginApi = (username: string, password: string) => {
  return post('/user/login', { username, password })
}

// 获取用户数量
export const getUserCount = () => {
  return get('/user/count')
}

// 番剧相关API
export const getAnimeStats = () => {
  return get('/anime/stats')
}

export const getAnimeList = (params: Record<string, unknown>) => {
  return get('/anime/list', params)
}

export const animeOff = (id: number) => {
  return del(`/anime/${id}`)
}

// 搜索统计API
export const getSearchStats = (params: Record<string, unknown> = {}) => {
  return get('/anime/search/stats', { limit: 20, days: 7, ...params })
}

export const crawlNow = (data: Record<string, unknown>) => {
  return post('/crawler/crawl-now', data)
}

export const crawlerAllSync = (type: number) => {
  return post(`/crawler/incremental/${type}`)
}

// Top100 API
export const getTop100 = () => {
  return get('/anime/top100')
}

// 定时任务 API
export const getTaskList = () => {
  return get('/crawler/tasks/list')
}

export const getTaskDetail = (id: number) => {
  return get(`/crawler/tasks/${id}`)
}

export const createTask = (data: Record<string, unknown>) => {
  return post('/crawler/tasks', data)
}

export const updateTask = (id: number, data: Record<string, unknown>) => {
  return put(`/crawler/tasks/${id}`, data)
}

export const deleteTaskApi = (id: number) => {
  return del(`/crawler/tasks/${id}`)
}

export const toggleTaskEnabled = (id: number, enabled: boolean) => {
  return put(`/crawler/tasks/${id}/toggle`, {} as Record<string, unknown>, { params: { enabled } })
}

export const executeTaskApi = (id: number) => {
  return post(`/crawler/tasks/${id}/execute`)
}

export const cancelTaskApi = (id: number) => {
  return post(`/crawler/tasks/${id}/cancel`)
}

export const quickSyncApi = (type: number, pages: number) => {
  return post(`/crawler/tasks/sync/${type}`, {} as Record<string, unknown>, { params: { pages } })
}

// 任务执行记录API
export const getTaskLogs = (params: Record<string, unknown>) => {
  return get('/crawler/tasks/logs', params)
}

// 访问统计API
export const getAccessStats = (days: number) => {
  return get('/anime/access/stats', { days })
}

// 设备统计API
export const getDeviceStats = (params: Record<string, unknown> = {}) => {
  return get('/anime/device/stats', params)
}

// 系统更新状态API（管理端专用）
export const getSystemUpdateStatus = () => {
  return get('/admin/system/update-status')
}

export const setSystemUpdateStatus = (data: Record<string, unknown>) => {
  return post('/admin/system/update-status', data)
}

export const toggleSystemUpdate = () => {
  return post('/admin/system/toggle-update')
}

export default api
