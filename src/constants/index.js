/**
 * 项目常量定义
 */

// 动漫类型
export const ANIME_TYPES = {
  CHINA: { id: 66, name: '中文', flag: '🇨🇳', label: '🇨🇳 中文' },
  JAPAN_KOREA: { id: 67, name: '日韩', flag: '🇯🇵', label: '🇯🇵 日韩' },
  WESTERN: { id: 68, name: '欧美', flag: '🌎', label: '🌎 欧美' }
}

// 番剧状态
export const ANIME_STATUS = {
  ONGOING: { code: 0, label: '连载中', class: 'b-green' },
  COMPLETED: { code: 1, label: '已完结', class: 'b-blue' },
  OFFLINE: { code: 2, label: '已下线', class: 'b-red' }
}

// 用户状态
export const USER_STATUS = {
  NORMAL: 'NORMAL',
  DISABLE: 'DISABLE'
}

// 任务状态
export const TASK_STATUS = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
}

// 任务执行记录状态
export const TASK_LOG_STATUS = {
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
}

// 轮播图类型
export const CAROUSEL_TYPE = {
  VIDEO: 'video',
  AD: 'ad'
}

// 轮播图状态
export const CAROUSEL_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled'
}

// App平台
export const APP_PLATFORM = {
  ANDROID: 'android',
  IOS: 'ios',
  ALL: 'all'
}

// App版本状态
export const APP_VERSION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
}

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  DEFAULT_PAGE_NUM: 1
}

// 刷新间隔（毫秒）
export const REFRESH_INTERVAL = {
  TASK_LIST: 30000, // 任务列表30秒
  DASHBOARD: 60000  // 仪表盘60秒
}

// 缓存时间（毫秒）
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000,    // 5分钟
  MEDIUM: 30 * 60 * 1000,  // 30分钟
  LONG: 24 * 60 * 60 * 1000 // 24小时
}

// 防抖延迟（毫秒）
export const DEBOUNCE_DELAY = {
  SEARCH: 500,    // 搜索防抖
  INPUT: 300      // 输入防抖
}

// Token Key
export const TOKEN_KEY = 'ms_token'

// 响应码
export const RESPONSE_CODE = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403
}

// 文件上传限制
export const UPLOAD_LIMITS = {
  ALLOWED_EXTENSIONS: ['.apk', '.ipa', '.exe', '.dmg'],
  MAX_FILE_SIZE: 500 * 1024 * 1024 // 500MB
}

// 辅助函数：获取动漫类型映射
export function getAnimeTypeMap() {
  return Object.values(ANIME_TYPES).reduce((map, type) => {
    map[type.id] = type.label
    return map
  }, {})
}

// 辅助函数：获取番剧状态映射
export function getAnimeStatusMap() {
  return Object.values(ANIME_STATUS).reduce((map, status) => {
    map[status.code] = [status.label, status.class]
    return map
  }, {})
}

// 辅助函数：根据ID获取动漫类型信息
export function getAnimeTypeById(id) {
  return Object.values(ANIME_TYPES).find(type => type.id === id)
}

// 辅助函数：根据代码获取番剧状态信息
export function getAnimeStatusByCode(code) {
  return Object.values(ANIME_STATUS).find(status => status.code === code)
}
