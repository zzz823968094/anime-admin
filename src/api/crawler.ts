/**
 * 爬虫管理相关API
 * @module api/crawler
 */

import request from './request'
import type { CrawlerFailRecord, ApiResponse } from '@/types/api'

/**
 * 获取爬虫失败记录
 * @returns Promise<ApiResponse<CrawlerFailRecord[]>>
 */
export function getFailRecords(): Promise<ApiResponse<CrawlerFailRecord[]>> {
  return request({
    url: '/crawler/fail',
    method: 'get'
  })
}

/**
 * 重启指定类型的爬虫任务
 * @param type - 爬虫类型 (66: 中文, 67: 日韩, 68: 欧美)
 * @returns Promise<ApiResponse<void>>
 */
export function restartCrawler(type: number): Promise<ApiResponse<void>> {
  return request({
    url: `/crawler/fail/restart/${type}`,
    method: 'put'
  })
}

/**
 * 根据ID重新爬取番剧数据
 * @param id - 番剧ID
 * @returns Promise<ApiResponse<void>>
 */
export function crawlById(id: number): Promise<ApiResponse<void>> {
  return request({
    url: '/crawler/crawl',
    method: 'put',
    params: { id }
  })
}
