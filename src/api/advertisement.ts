/**
 * 广告管理相关API
 * @module api/advertisement
 */

import request from './request'
import type { Advertisement, PageParams, PageResult, ApiResponse } from '@/types/api'

/**
 * 获取广告列表
 * @param params - 查询参数
 * @returns Promise<ApiResponse<PageResult<Advertisement>>>
 */
export function getAdList(params: PageParams): Promise<ApiResponse<PageResult<Advertisement>>> {
  return request({
    url: '/ad/page',
    method: 'get',
    params
  })
}

/**
 * 获取广告详情
 * @param id - 广告ID
 * @returns Promise<ApiResponse<Advertisement>>
 */
export function getAdDetail(id: number): Promise<ApiResponse<Advertisement>> {
  return request({
    url: `/ad/${id}`,
    method: 'get'
  })
}

/**
 * 创建广告
 * @param data - 广告信息
 * @returns Promise<ApiResponse<Advertisement>>
 */
export function createAd(
  data: Omit<Advertisement, 'id' | 'createTime' | 'updateTime'>
): Promise<ApiResponse<Advertisement>> {
  return request({
    url: '/ad',
    method: 'post',
    data
  })
}

/**
 * 更新广告
 * @param id - 广告ID
 * @param data - 广告信息
 * @returns Promise<ApiResponse<Advertisement>>
 */
export function updateAd(
  id: number,
  data: Partial<Omit<Advertisement, 'id' | 'createTime' | 'updateTime'>>
): Promise<ApiResponse<Advertisement>> {
  return request({
    url: `/ad/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除广告
 * @param id - 广告ID
 * @returns Promise<ApiResponse<void>>
 */
export function deleteAd(id: number): Promise<ApiResponse<void>> {
  return request({
    url: `/ad/${id}`,
    method: 'delete'
  })
}

/**
 * 启用广告
 * @param id - 广告ID
 * @returns Promise<ApiResponse<void>>
 */
export function enableAd(id: number): Promise<ApiResponse<void>> {
  return request({
    url: `/ad/${id}/enable`,
    method: 'put'
  })
}

/**
 * 禁用广告
 * @param id - 广告ID
 * @returns Promise<ApiResponse<void>>
 */
export function disableAd(id: number): Promise<ApiResponse<void>> {
  return request({
    url: `/ad/${id}/disable`,
    method: 'put'
  })
}
