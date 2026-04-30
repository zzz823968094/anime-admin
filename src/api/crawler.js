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
 * @param {number} type - 爬虫类型 (24: 中国, 25: 日本, 26: 美国)
 */
export function restartCrawler(type) {
  return request({
    url: `/api/crawler/fail/restart/${type}`,
    method: 'put'
  })
}