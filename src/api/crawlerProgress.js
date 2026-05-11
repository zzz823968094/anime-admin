import request from './request'

/**
 * 启动爬取任务
 * @param {number} type - 任务类型 (66: 中文, 67: 日韩, 68: 欧美)
 * @param {number} hour - 时间范围(小时)
 */
export function startCrawlTask(type, hour) {
  return request({
    url: '/api/crawler/crawl-now',
    method: 'post',
    data: { type, hour }
  })
}

/**
 * 获取任务进度
 * @param {string} taskKey - 任务密钥
 */
export function getTaskProgress(taskKey) {
  return request({
    url: `/api/crawler/progress/${taskKey}`,
    method: 'get'
  })
}

/**
 * 获取最近任务列表
 * @param {number} limit - 限制数量
 */
export function getRecentTasks(limit = 10) {
  return request({
    url: '/api/crawler/progress/recent',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取运行中的任务
 * @param {number} type - 任务类型 (可选)
 */
export function getRunningTask(type = null) {
  const url = type ? `/api/crawler/progress/running/${type}` : '/api/crawler/progress/running'
  return request({
    url,
    method: 'get'
  })
}

/**
 * 清理过期记录
 */
export function cleanExpiredProgress() {
  return request({
    url: '/api/crawler/progress/clean',
    method: 'post'
  })
}