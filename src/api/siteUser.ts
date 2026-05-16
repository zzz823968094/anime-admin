/**
 * 站点用户相关API
 * @module api/siteUser
 */

import request from './request'
import type { SiteUser, PageParams, PageResult, ApiResponse } from '@/types/api'

/**
 * 获取用户列表
 * @param params - 查询参数
 * @returns Promise<ApiResponse<PageResult<SiteUser>>>
 */
export const getSiteUserList = (params: PageParams): Promise<ApiResponse<PageResult<SiteUser>>> => {
  return request({
    url: '/user/list',
    method: 'get',
    params
  })
}

/**
 * 获取用户总数
 * @returns Promise<ApiResponse<number>>
 */
export const getSiteUserCount = (): Promise<ApiResponse<number>> => {
  return request({
    url: '/user/count',
    method: 'get'
  })
}

/**
 * 封禁/解封用户
 * @param id - 用户ID
 * @param status - 状态
 * @returns Promise<ApiResponse<void>>
 */
export const updateSiteUserStatus = (id: number, status: number): Promise<ApiResponse<void>> => {
  return request({
    url: `/user/${id}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 删除用户
 * @param id - 用户ID
 * @returns Promise<ApiResponse<void>>
 */
export const deleteSiteUser = (id: number): Promise<ApiResponse<void>> => {
  return request({
    url: `/user/${id}`,
    method: 'delete'
  })
}
