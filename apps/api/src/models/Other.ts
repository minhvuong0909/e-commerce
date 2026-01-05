import { MediaType } from '~/constants/enums'

// schema của media kh lưu dưới mongo và lưu trên cloud
export interface Media {
  url: string
  type: MediaType
}
