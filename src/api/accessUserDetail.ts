/**
 * 访问用户详情相关API
 * @module api/accessUserDetail
 */

import request from './request'
import type { RetentionRate, LocationStats, ApiResponse } from '@/types/api'

/**
 * 获取留存率数据
 * @param params - 请求参数
 * @param params.baseDate - 基准日期 YYYYMMDD，不传则使用昨天
 * @returns Promise<ApiResponse<RetentionRate>> 留存率数据，key为天数，value为留存率百分比
 */
export function getRetentionRate(params?: {
  baseDate?: number
}): Promise<ApiResponse<RetentionRate>> {
  return request({
    url: '/access/user-detail/retention',
    method: 'get',
    params
  })
}

/**
 * 获取地理位置统计数据
 * @param params - 请求参数
 * @param params.days - 统计最近N天的数据，默认30天
 * @returns Promise<ApiResponse<LocationStats[]>> 地理位置统计数据列表
 */
export function getLocationStats(params?: {
  days?: number
}): Promise<ApiResponse<LocationStats[]>> {
  return request({
    url: '/access/user-detail/location-stats',
    method: 'get',
    params
  })
}

/**
 * 手动触发IP地理位置更新
 * @returns Promise<ApiResponse<void>> 操作结果
 */
export function updateLocation(): Promise<ApiResponse<void>> {
  return request({
    url: '/access/user-detail/update-location',
    method: 'post'
  })
}
