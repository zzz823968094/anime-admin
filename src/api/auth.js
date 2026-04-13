import request from './request'

/**
 * 管理员登录
 * @param {Object} data - 登录信息
 * @param {string} data.account - 账号
 * @param {string} data.password - 密码
 * @returns {Promise<{code: number, message: string, data: {access_token: string}}>}
 */
export function login(data) {
  return request({
    url: '/api/admin/login',
    method: 'post',
    data
  })
}
