/**
 * 广告位管理相关API
 * @module api/adPosition
 */

import request from './request'
import type { AdPosition, ApiResponse } from '@/types/api'

/**
 * 获取所有广告位
 * @returns Promise<ApiResponse<AdPosition[]>>
 */
export function getAllPositions(): Promise<ApiResponse<AdPosition[]>> {
  return request({
    url: '/ad-position',
    method: 'get'
  })
}

/**
 * 获取所有启用的广告位
 * @returns Promise<ApiResponse<AdPosition[]>>
 */
export function getActivePositions(): Promise<ApiResponse<AdPosition[]>> {
  return request({
    url: '/ad-position/active',
    method: 'get'
  })
}

/**
 * 创建广告位
 * @param data - 广告位信息
 * @returns Promise<ApiResponse<AdPosition>>
 */
export function createPosition(
  data: Omit<AdPosition, 'id' | 'createTime' | 'updateTime'>
): Promise<ApiResponse<AdPosition>> {
  return request({
    url: '/ad-position',
    method: 'post',
    data
  })
}

/**
 * 更新广告位
 * @param id - 广告位ID
 * @param data - 广告位信息
 * @returns Promise<ApiResponse<AdPosition>>
 */
export function updatePosition(
  id: number,
  data: Partial<Omit<AdPosition, 'id' | 'createTime' | 'updateTime'>>
): Promise<ApiResponse<AdPosition>> {
  return request({
    url: `/ad-position/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除广告位
 * @param id - 广告位ID
 * @returns Promise<ApiResponse<void>>
 */
export function deletePosition(id: number): Promise<ApiResponse<void>> {
  return request({
    url: `/ad-position/${id}`,
    method: 'delete'
  })
}
