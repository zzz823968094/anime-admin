import request from './request'

export function getCarouselList(params) {
  return request({ url: '/api/admin/carousels/list', method: 'get', params })
}

export function getCarouselDetail(id) {
  return request({ url: `/api/admin/carousels/${id}`, method: 'get' })
}

export function createCarousel(data) {
  return request({ url: '/api/admin/carousels', method: 'post', data })
}

export function updateCarousel(id, data) {
  return request({ url: `/api/admin/carousels/${id}`, method: 'put', data })
}

export function deleteCarousel(id) {
  return request({ url: `/api/admin/carousels/${id}`, method: 'delete' })
}

export function enableCarousel(id) {
  return request({ url: `/api/admin/carousels/${id}/enable`, method: 'put' })
}

export function disableCarousel(id) {
  return request({ url: `/api/admin/carousels/${id}/disable`, method: 'put' })
}
