import request from './request'

/**
 * 获取爬虫失败记录
 */
export function getFailRecords() {
  return request({
    url: '/api/crawler/fail',
    method: 'get'
  })
}

/**
 * 重启指定类型的爬虫任务
 * @param {number} type - 爬虫类型 (66: 中文, 67: 日韩, 68: 欧美)
 */
export function restartCrawler(type) {
  return request({
    url: `/api/crawler/fail/restart/${type}`,
    method: 'put'
  })
}

/**
 * 根据ID重新爬取番剧数据
 * @param {number} id - 番剧ID
 */
export function crawlById(id) {
  return request({
    url: '/api/crawler/crawl',
    method: 'put',
    params: { id }
  })
}