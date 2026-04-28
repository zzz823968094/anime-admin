import request from './request'

export function getVersionList(params) {
  return request({ url: '/api/admin/app-versions/list', method: 'get', params })
}

export function getVersionDetail(id) {
  return request({ url: `/api/admin/app-versions/${id}`, method: 'get' })
}

export function createVersion(data) {
  return request({ url: '/api/admin/app-versions', method: 'post', data })
}

export function updateVersion(id, data) {
  return request({ url: `/api/admin/app-versions/${id}`, method: 'put', data })
}

export function deleteVersion(id) {
  return request({ url: `/api/admin/app-versions/${id}`, method: 'delete' })
}

export function getLatestVersion(platform) {
  return request({ url: '/api/admin/app-versions/latest', method: 'get', params: { platform } })
}

export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({ 
    url: '/api/admin/app-versions/upload', 
    method: 'post', 
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 300000  // 5分钟超时，适用于大文件上传
  })
}
