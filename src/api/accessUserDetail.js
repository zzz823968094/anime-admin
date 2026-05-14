/**
 * 访问用户详情相关API
 * @module api/accessUserDetail
 */

import request from './request'

/**
 * 获取留存率数据
 * @param {Object} params - 请求参数
 * @param {number} [params.baseDate] - 基准日期 YYYYMMDD，不传则使用昨天
 * @returns {Promise<Object>} 留存率数据，key为天数，value为留存率百分比
 */
export function getRetentionRate(params) {
  return request({
    url: '/api/access/user-detail/retention',
    method: 'get',
    params
  })
}

/**
 * 获取地理位置统计数据
 * @param {Object} params - 请求参数
 * @param {number} [params.days=30] - 统计最近N天的数据，默认30天
 * @returns {Promise<Array>} 地理位置统计数据列表
 */
export function getLocationStats(params) {
  return request({
    url: '/api/access/user-detail/location-stats',
    method: 'get',
    params
  })
}

/**
 * 手动触发IP地理位置更新
 * @returns {Promise<Object>} 操作结果
 */
export function updateLocation() {
  return request({
    url: '/api/access/user-detail/update-location',
    method: 'post'
  })
}
