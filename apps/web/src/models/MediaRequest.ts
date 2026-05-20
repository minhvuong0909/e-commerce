export interface Media {
  url: string
  type: MediaType
}

type MediaType = 'image' | 'video'
