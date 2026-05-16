/**
 * API 响应基础类型定义
 */

/**
 * 通用API响应结构
 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/**
 * 分页请求参数
 */
export interface PageParams {
  pageNum: number
  pageSize: number
  [key: string]: unknown
}

/**
 * 分页响应数据
 */
export interface PageResult<T = unknown> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}

/**
 * 管理员信息
 */
export interface AdminUser {
  id: number
  account: string
  name: string
  phone?: string
  status: 'NORMAL' | 'DISABLE'
  createTime?: string
  updateTime?: string
}

/**
 * 登录请求参数
 */
export interface LoginParams {
  account: string
  password: string
}

/**
 * 登录响应数据
 */
export interface LoginResult {
  access_token: string
}

/**
 * 站点用户信息
 */
export interface SiteUser {
  id: number
  username: string
  phone?: string
  status: number
  createTime?: string
  updateTime?: string
}

/**
 * 轮播图信息
 */
export interface Carousel {
  id: number
  title: string
  imageUrl: string
  linkUrl?: string
  sortOrder: number
  status: number
  createTime?: string
  updateTime?: string
}

/**
 * App版本信息
 */
export interface AppVersion {
  id: number
  platform: string
  version: string
  versionCode: number
  downloadUrl?: string
  updateLog?: string
  isForceUpdate: number
  status: number
  createTime?: string
  updateTime?: string
}

/**
 * 广告信息
 */
export interface Advertisement {
  id: number
  name: string
  type: number
  imageUrl?: string
  linkUrl?: string
  status: number
  createTime?: string
  updateTime?: string
}

/**
 * 广告位信息
 */
export interface AdPosition {
  id: number
  positionCode: string
  positionName: string
  description?: string
  status: number
  createTime?: string
  updateTime?: string
}

/**
 * 广告投放策略
 */
export interface AdStrategy {
  id: number
  adId: number
  positionId: number
  priority: number
  startDate?: string
  endDate?: string
  status: number
  createTime?: string
  updateTime?: string
}

/**
 * 爬虫失败记录
 */
export interface CrawlerFailRecord {
  id: number
  animeId: number
  type: number
  failReason?: string
  createTime?: string
}

/**
 * 爬虫任务进度
 */
export interface CrawlerProgress {
  taskKey: string
  type: number
  status: string
  progress: number
  total: number
  current: number
  startTime?: string
  endTime?: string
}

/**
 * 访问用户详情统计
 */
export interface RetentionRate {
  [day: number]: number
}

/**
 * 地理位置统计
 */
export interface LocationStats {
  province?: string
  city?: string
  count: number
  percentage: number
}
