/**
 * 认证相关API
 * @module api/auth
 */

import request from './request'
import type { LoginParams, LoginResult, ApiResponse } from '@/types/api'

/**
 * 管理员登录
 * @param data - 登录信息
 * @returns Promise<ApiResponse<LoginResult>>
 */
export function login(data: LoginParams): Promise<ApiResponse<LoginResult>> {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}
