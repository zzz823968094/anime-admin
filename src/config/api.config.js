// API 配置
const API_CONFIG = {
  // 开发环境默认地址
  DEV_BASE_URL: 'http://localhost:8080',
  // 生产环境默认地址
  PROD_BASE_URL: 'https://lsj.animeparadise.vip'
}

// 根据环境获取 baseURL
export const getBaseURL = () => {
  return import.meta.env.VITE_API_BASE_URL || 
         (import.meta.env.MODE === 'production' ? API_CONFIG.PROD_BASE_URL : API_CONFIG.DEV_BASE_URL)
}

export default API_CONFIG