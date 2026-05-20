import api from '../configs/api'

export const uploadImageApi = (data: FormData) => {
  return api.post('/medias/upload-image', data)
}

export const uploadVideoApi = (data: FormData) => {
  return api.post('/medias/upload-video', data)
}
