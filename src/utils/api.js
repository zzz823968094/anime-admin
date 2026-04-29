import axios from 'axios'
import { getBaseURL } from '@/config/api.config'

// const API_BASE = 'https://lsj.animeparadise.vip'
const API_BASE = getBaseURL()

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ms_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
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
export const get = (url, params = {}) => {
  return api.get(url, { params })
}

export const post = (url, data = {}, config = {}) => {
  return api.post(url, data, config)
}

export const put = (url, data = {}, config = {}) => {
  return api.put(url, data, config)
}

export const del = (url) => {
  return api.delete(url)
}

// 登录API
export const loginApi = (username, password) => {
  return post('/api/user/login', { username, password })
}

// 获取用户数量
export const getUserCount = () => {
  return get('/api/user/count')
}
// 获取用户数量
export const getVideoCount = () => {
  return get('/api/video/totalCount')
}
// 番剧相关API
export const getAnimeStats = () => {
  return get('/api/anime/stats')
}

export const getAnimeList = (params) => {
  return get('/api/anime/list', params)
}


export const animeOff = (id) => {
  return del(`/api/anime/${id}`)
}



// 搜索统计API
export const getSearchStats = (params = {}) => {
  return get('/api/anime/search/stats', { limit: 20, days: 7, ...params })
}

export const crawlNow = (data) => {
  return post('/api/crawler/crawl-now', data)
}

export const crawlerAllSync = (type) => {
  return post(`/api/crawler/incremental/${type}`)
}

// Top100 API
export const getTop100 = () => {
  return get('/api/anime/top100')
}

// 定时任务 API
export const getTaskList = () => {
  return get('/api/crawler/tasks/list')
}

export const getTaskDetail = (id) => {
  return get(`/api/crawler/tasks/${id}`)
}

export const createTask = (data) => {
  return post('/api/crawler/tasks', data)
}

export const updateTask = (id, data) => {
  return put(`/api/crawler/tasks/${id}`, data)
}

export const deleteTaskApi = (id) => {
  return del(`/api/crawler/tasks/${id}`)
}

export const toggleTaskEnabled = (id, enabled) => {
  return put(`/api/crawler/tasks/${id}/toggle`, null, { params: { enabled } })
}

export const executeTaskApi = (id) => {
  return post(`/api/crawler/tasks/${id}/execute`)
}

export const cancelTaskApi = (id) => {
  return post(`/api/crawler/tasks/${id}/cancel`)
}

export const quickSyncApi = (type, pages) => {
  return post(`/api/crawler/tasks/sync/${type}`, null, { params: { pages } })
}

// 任务执行记录API
export const getTaskLogs = (params) => {
  return get('/api/crawler/tasks/logs', params)
}

// 访问统计API
export const getAccessStats = () => {
  return get('/api/anime/access/stats')
}

export default api
