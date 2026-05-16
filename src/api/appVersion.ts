/**
 * App版本管理相关API
 * @module api/appVersion
 */

import request from './request'
import type { AppVersion, PageParams, PageResult, ApiResponse } from '@/types/api'

/**
 * 获取版本列表
 * @param params - 查询参数
 * @returns Promise<ApiResponse<PageResult<AppVersion>>>
 */
export function getVersionList(params: PageParams): Promise<ApiResponse<PageResult<AppVersion>>> {
  return request({ url: '/admin/app-versions/list', method: 'get', params })
}

/**
 * 获取版本详情
 * @param id - 版本ID
 * @returns Promise<ApiResponse<AppVersion>>
 */
export function getVersionDetail(id: number): Promise<ApiResponse<AppVersion>> {
  return request({ url: `/admin/app-versions/${id}`, method: 'get' })
}

/**
 * 创建版本
 * @param data - 版本信息
 * @returns Promise<ApiResponse<AppVersion>>
 */
export function createVersion(
  data: Omit<AppVersion, 'id' | 'createTime' | 'updateTime'>
): Promise<ApiResponse<AppVersion>> {
  return request({ url: '/admin/app-versions', method: 'post', data })
}

/**
 * 更新版本
 * @param id - 版本ID
 * @param data - 版本信息
 * @returns Promise<ApiResponse<AppVersion>>
 */
export function updateVersion(
  id: number,
  data: Partial<Omit<AppVersion, 'id' | 'createTime' | 'updateTime'>>
): Promise<ApiResponse<AppVersion>> {
  return request({ url: `/admin/app-versions/${id}`, method: 'put', data })
}

/**
 * 删除版本
 * @param id - 版本ID
 * @returns Promise<ApiResponse<void>>
 */
export function deleteVersion(id: number): Promise<ApiResponse<void>> {
  return request({ url: `/admin/app-versions/${id}`, method: 'delete' })
}

/**
 * 获取最新版本
 * @param platform - 平台类型
 * @returns Promise<ApiResponse<AppVersion>>
 */
export function getLatestVersion(platform: string): Promise<ApiResponse<AppVersion>> {
  return request({ url: '/admin/app-versions/latest', method: 'get', params: { platform } })
}

/**
 * 上传文件
 * @param file - 文件对象
 * @returns Promise<ApiResponse<any>>
 */
export function uploadFile(file: File): Promise<ApiResponse<any>> {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/admin/app-versions/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 300000 // 5分钟超时，适用于大文件上传
  })
}
