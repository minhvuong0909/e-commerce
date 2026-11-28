import api from '../configs/api'

export const uploadImageApi = (data: FormData) => {
  return api.post('/medias/upload-image', data)
}

export const uploadVideoApi = (data: FormData, onProgress?: (percent: number) => void) => {
  return api.post<{ url: { url: string; type: number }[] }>('/medias/upload-video', data, {
    timeout: 0, // video tới 50MB: không cắt ngang khi mạng chậm
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
    }
  })
}
