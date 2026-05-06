import request from './request'

// 获取所有广告位
export function getAllPositions() {
  return request({
    url: '/api/ad-position',
    method: 'get'
  })
}

// 获取所有启用的广告位
export function getActivePositions() {
  return request({
    url: '/api/ad-position/active',
    method: 'get'
  })
}

// 创建广告位
export function createPosition(data) {
  return request({
    url: '/api/ad-position',
    method: 'post',
    data
  })
}

// 更新广告位
export function updatePosition(id, data) {
  return request({
    url: `/api/ad-position/${id}`,
    method: 'put',
    data
  })
}

// 删除广告位
export function deletePosition(id) {
  return request({
    url: `/api/ad-position/${id}`,
    method: 'delete'
  })
}
