declare module '@/config/api.config' {
  export function getBaseURL(): string
  const API_CONFIG: {
    DEV_BASE_URL: string
    PROD_BASE_URL: string
  }
  export default API_CONFIG
}
