import request from './request'

/**
 * 分页查询管理员列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 * @param {string} params.name - 名称模糊查询
 * @param {string} params.status - 状态查询
 */
export function getUserList(params) {
  return request({
    url: '/api/admin/users/list',
    method: 'get',
    params
  })
}

/**
 * 获取管理员详情
 * @param {number} id - 管理员ID
 */
export function getUserDetail(id) {
  return request({
    url: `/api/admin/users/${id}`,
    method: 'get'
  })
}

/**
 * 创建管理员
 * @param {Object} data - 管理员信息
 * @param {string} data.account - 账号
 * @param {string} data.name - 姓名
 * @param {string} data.phone - 手机号
 * @param {string} data.password - 密码
 * @param {string} data.status - 状态
 */
export function createUser(data) {
  return request({
    url: '/api/admin/users',
    method: 'post',
    data
  })
}

/**
 * 更新管理员
 * @param {number} id - 管理员ID
 * @param {Object} data - 管理员信息
 * @param {string} data.name - 姓名
 * @param {string} data.phone - 手机号
 * @param {string} data.password - 密码
 * @param {string} data.status - 状态
 */
export function updateUser(id, data) {
  return request({
    url: `/api/admin/users/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除管理员
 * @param {number} id - 管理员ID
 */
export function deleteUser(id) {
  return request({
    url: `/api/admin/users/${id}`,
    method: 'delete'
  })
}

/**
 * 启用/禁用管理员
 * @param {number} id - 管理员ID
 * @param {string} status - 状态：NORMAL 或 DISABLE
 */
export function updateUserStatus(id, status) {
  return request({
    url: `/api/admin/users/${id}/status`,
    method: 'put',
    data: status,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}
