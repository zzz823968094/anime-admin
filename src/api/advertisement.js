import request from './request'

// 获取广告列表
export function getAdList(params) {
  return request({
    url: '/api/ad/page',
    method: 'get',
    params
  })
}

// 获取广告详情
export function getAdDetail(id) {
  return request({
    url: `/api/ad/${id}`,
    method: 'get'
  })
}

// 创建广告
export function createAd(data) {
  return request({
    url: '/api/ad',
    method: 'post',
    data
  })
}

// 更新广告
export function updateAd(id, data) {
  return request({
    url: `/api/ad/${id}`,
    method: 'put',
    data
  })
}

// 删除广告
export function deleteAd(id) {
  return request({
    url: `/api/ad/${id}`,
    method: 'delete'
  })
}

// 启用广告
export function enableAd(id) {
  return request({
    url: `/api/ad/${id}/enable`,
    method: 'put'
  })
}

// 禁用广告
export function disableAd(id) {
  return request({
    url: `/api/ad/${id}/disable`,
    method: 'put'
  })
}
