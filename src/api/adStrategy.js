import request from './request'

// 查询广告的所有策略
export function getStrategiesByAdId(adId) {
  return request({
    url: `/api/ad-strategy/ad/${adId}`,
    method: 'get'
  })
}

// 创建投放策略
export function createStrategy(data) {
  return request({
    url: '/api/ad-strategy',
    method: 'post',
    data
  })
}

// 更新投放策略
export function updateStrategy(id, data) {
  return request({
    url: `/api/ad-strategy/${id}`,
    method: 'put',
    data
  })
}

// 删除投放策略
export function deleteStrategy(id) {
  return request({
    url: `/api/ad-strategy/${id}`,
    method: 'delete'
  })
}

// 批量删除广告的策略
export function deleteStrategiesByAdId(adId) {
  return request({
    url: `/api/ad-strategy/ad/${adId}`,
    method: 'delete'
  })
}
