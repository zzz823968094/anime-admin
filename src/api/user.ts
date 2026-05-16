/**
 * 管理员用户相关API
 * @module api/user
 */

import request from './request'
import type { AdminUser, PageParams, PageResult, ApiResponse } from '@/types/api'

/**
 * 分页查询管理员列表
 * @param params - 查询参数
 * @returns Promise<ApiResponse<PageResult<AdminUser>>>
 */
export function getUserList(params: PageParams): Promise<ApiResponse<PageResult<AdminUser>>> {
  return request({
    url: '/admin/users/list',
    method: 'get',
    params
  })
}

/**
 * 获取管理员详情
 * @param id - 管理员ID
 * @returns Promise<ApiResponse<AdminUser>>
 */
export function getUserDetail(id: number): Promise<ApiResponse<AdminUser>> {
  return request({
    url: `/admin/users/${id}`,
    method: 'get'
  })
}

/**
 * 创建管理员
 * @param data - 管理员信息
 * @returns Promise<ApiResponse<AdminUser>>
 */
export function createUser(
  data: Omit<AdminUser, 'id' | 'createTime' | 'updateTime'>
): Promise<ApiResponse<AdminUser>> {
  return request({
    url: '/admin/users',
    method: 'post',
    data
  })
}

/**
 * 更新管理员
 * @param id - 管理员ID
 * @param data - 管理员信息
 * @returns Promise<ApiResponse<AdminUser>>
 */
export function updateUser(
  id: number,
  data: Partial<Omit<AdminUser, 'id' | 'account' | 'createTime' | 'updateTime'>>
): Promise<ApiResponse<AdminUser>> {
  return request({
    url: `/admin/users/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除管理员
 * @param id - 管理员ID
 * @returns Promise<ApiResponse<void>>
 */
export function deleteUser(id: number): Promise<ApiResponse<void>> {
  return request({
    url: `/admin/users/${id}`,
    method: 'delete'
  })
}

/**
 * 启用/禁用管理员
 * @param id - 管理员ID
 * @param status - 状态：NORMAL 或 DISABLE
 * @returns Promise<ApiResponse<void>>
 */
export function updateUserStatus(
  id: number,
  status: 'NORMAL' | 'DISABLE'
): Promise<ApiResponse<void>> {
  return request({
    url: `/admin/users/${id}/status`,
    method: 'put',
    data: status,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}
