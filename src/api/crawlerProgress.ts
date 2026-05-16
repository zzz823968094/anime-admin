/**
 * 爬虫任务进度相关API
 * @module api/crawlerProgress
 */

import request from './request'
import type { CrawlerProgress, ApiResponse } from '@/types/api'

/**
 * 启动爬取任务
 * @param type - 任务类型 (66: 中文, 67: 日韩, 68: 欧美)
 * @param hour - 时间范围(小时)
 * @returns Promise<ApiResponse<any>>
 */
export function startCrawlTask(type: number, hour: number): Promise<ApiResponse<any>> {
  return request({
    url: '/crawler/crawl-now',
    method: 'post',
    data: { type, hour }
  })
}

/**
 * 获取任务进度
 * @param taskKey - 任务密钥
 * @returns Promise<ApiResponse<CrawlerProgress>>
 */
export function getTaskProgress(taskKey: string): Promise<ApiResponse<CrawlerProgress>> {
  return request({
    url: `/crawler/progress/${taskKey}`,
    method: 'get'
  })
}

/**
 * 获取最近任务列表
 * @param limit - 限制数量
 * @returns Promise<ApiResponse<CrawlerProgress[]>>
 */
export function getRecentTasks(limit: number = 10): Promise<ApiResponse<CrawlerProgress[]>> {
  return request({
    url: '/crawler/progress/recent',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取运行中的任务
 * @param type - 任务类型 (可选)
 * @returns Promise<ApiResponse<CrawlerProgress | null>>
 */
export function getRunningTask(
  type: number | null = null
): Promise<ApiResponse<CrawlerProgress | null>> {
  const url = type ? `/crawler/progress/running/${type}` : '/crawler/progress/running'
  return request({
    url,
    method: 'get'
  })
}

/**
 * 清理过期记录
 * @returns Promise<ApiResponse<void>>
 */
export function cleanExpiredProgress(): Promise<ApiResponse<void>> {
  return request({
    url: '/crawler/progress/clean',
    method: 'post'
  })
}
