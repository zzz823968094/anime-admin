/**
 * 轮播图相关API
 * @module api/carousel
 */

import request from './request'
import type { Carousel, PageParams, PageResult, ApiResponse } from '@/types/api'

/**
 * 获取轮播图列表
 * @param params - 查询参数
 * @returns Promise<ApiResponse<PageResult<Carousel>>>
 */
export function getCarouselList(params: PageParams): Promise<ApiResponse<PageResult<Carousel>>> {
  return request({ url: '/admin/carousels/list', method: 'get', params })
}

/**
 * 获取轮播图详情
 * @param id - 轮播图ID
 * @returns Promise<ApiResponse<Carousel>>
 */
export function getCarouselDetail(id: number): Promise<ApiResponse<Carousel>> {
  return request({ url: `/admin/carousels/${id}`, method: 'get' })
}

/**
 * 创建轮播图
 * @param data - 轮播图信息
 * @returns Promise<ApiResponse<Carousel>>
 */
export function createCarousel(
  data: Omit<Carousel, 'id' | 'createTime' | 'updateTime'>
): Promise<ApiResponse<Carousel>> {
  return request({ url: '/admin/carousels', method: 'post', data })
}

/**
 * 更新轮播图
 * @param id - 轮播图ID
 * @param data - 轮播图信息
 * @returns Promise<ApiResponse<Carousel>>
 */
export function updateCarousel(
  id: number,
  data: Partial<Omit<Carousel, 'id' | 'createTime' | 'updateTime'>>
): Promise<ApiResponse<Carousel>> {
  return request({ url: `/admin/carousels/${id}`, method: 'put', data })
}

/**
 * 删除轮播图
 * @param id - 轮播图ID
 * @returns Promise<ApiResponse<void>>
 */
export function deleteCarousel(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/admin/carousels/${id}`, method: 'delete' })
}

/**
 * 启用轮播图
 * @param id - 轮播图ID
 * @returns Promise<ApiResponse<void>>
 */
export function enableCarousel(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/admin/carousels/${id}/enable`, method: 'put' })
}

/**
 * 禁用轮播图
 * @param id - 轮播图ID
 * @returns Promise<ApiResponse<void>>
 */
export function disableCarousel(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/admin/carousels/${id}/disable`, method: 'put' })
}
