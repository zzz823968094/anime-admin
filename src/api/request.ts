import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { getBaseURL } from '@/config/api.config'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ms_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 重要：如果data是FormData，删除Content-Type头，让浏览器自动设置
    // 这样axios会自动添加正确的boundary参数
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    // 统一响应格式处理
    if (res.code !== 200) {
      const message = res.message || '请求失败'

      // 401 未授权，跳转到登录页
      if (res.code === 401) {
        localStorage.removeItem('ms_token')
        window.location.href = '/login'
        return Promise.reject(new Error(message))
      }

      // 403 账号被禁用
      if (res.code === 403) {
        return Promise.reject(new Error(message))
      }

      return Promise.reject(new Error(message))
    }

    return res
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ms_token')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default request
