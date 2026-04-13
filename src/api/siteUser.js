import request from './request'

// 获取用户列表
export const getSiteUserList = (params) => {
  return request({
    url: '/api/user/list',
    method: 'get',
    params
  })
}

// 获取用户总数
export const getSiteUserCount = () => {
  return request({
    url: '/api/user/count',
    method: 'get'
  })
}

// 封禁/解封用户
export const updateSiteUserStatus = (id, status) => {
  return request({
    url: `/api/user/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 删除用户
export const deleteSiteUser = (id) => {
  return request({
    url: `/api/user/${id}`,
    method: 'delete'
  })
}
