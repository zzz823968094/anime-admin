/**
 * API 配置
 */

interface ApiConfig {
  DEV_BASE_URL: string
  PROD_BASE_URL: string
}

// API 配置
const API_CONFIG: ApiConfig = {
  // 开发环境使用相对路径，通过Vite代理转发
  DEV_BASE_URL: '/api',
  // 生产环境使用完整地址
  PROD_BASE_URL: 'https://lsj.animeparadise.vip/api'
}

// 根据环境获取 baseURL
// 优先级：环境变量 > 默认配置
export const getBaseURL = (): string => {
  // 如果环境变量显式配置了API地址，优先使用
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // 否则根据环境自动选择
  return import.meta.env.MODE === 'production' 
    ? API_CONFIG.PROD_BASE_URL 
    : API_CONFIG.DEV_BASE_URL
}

export default API_CONFIG
