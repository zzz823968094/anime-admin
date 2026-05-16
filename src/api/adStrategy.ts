/**
 * 广告投放策略相关API
 * @module api/adStrategy
 */

import request from './request'
import type { AdStrategy, ApiResponse } from '@/types/api'

/**
 * 查询广告的所有策略
 * @param adId - 广告ID
 * @returns Promise<ApiResponse<AdStrategy[]>>
 */
export function getStrategiesByAdId(adId: number): Promise<ApiResponse<AdStrategy[]>> {
  return request({
    url: `/ad-strategy/ad/${adId}`,
    method: 'get'
  })
}

/**
 * 创建投放策略
 * @param data - 策略信息
 * @returns Promise<ApiResponse<AdStrategy>>
 */
export function createStrategy(
  data: Omit<AdStrategy, 'id' | 'createTime' | 'updateTime'>
): Promise<ApiResponse<AdStrategy>> {
  return request({
    url: '/ad-strategy',
    method: 'post',
    data
  })
}

/**
 * 更新投放策略
 * @param id - 策略ID
 * @param data - 策略信息
 * @returns Promise<ApiResponse<AdStrategy>>
 */
export function updateStrategy(
  id: number,
  data: Partial<Omit<AdStrategy, 'id' | 'createTime' | 'updateTime'>>
): Promise<ApiResponse<AdStrategy>> {
  return request({
    url: `/ad-strategy/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除投放策略
 * @param id - 策略ID
 * @returns Promise<ApiResponse<void>>
 */
export function deleteStrategy(id: number): Promise<ApiResponse<void>> {
  return request({
    url: `/ad-strategy/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除广告的策略
 * @param adId - 广告ID
 * @returns Promise<ApiResponse<void>>
 */
export function deleteStrategiesByAdId(adId: number): Promise<ApiResponse<void>> {
  return request({
    url: `/ad-strategy/ad/${adId}`,
    method: 'delete'
  })
}
