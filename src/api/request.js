import axios from 'axios'
import { getBaseURL } from '@/config/api.config'

// 创建 axios 实例
const request = axios.create({
    baseURL: getBaseURL(),
    timeout: 10000,
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
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response) => {
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
        const message = error.response?.data?.message || error.message || '网络错误'

        if (error.response?.status === 401) {
            localStorage.removeItem('ms_token')
            window.location.href = '/login'
        }

        return Promise.reject(error)
    }
)

export default request
