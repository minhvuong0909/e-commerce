import { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

// các lỗi từ toàn bộ hệ thống sẽ đc dồn vào đây
export const defaultErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ErrorWithStatus) {
    res.status(error.status).json(omit(error, ['status']))
  } else {
    // lỗi có thể sẽ có stack và k có status
    // chỉnh hết các key trong object về enumerable: true
    Object.getOwnPropertyNames(error).forEach((key) => {
      Object.defineProperty(error, key, { enumerable: true })
    })
    res.status(error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      errorInfor: omit(error, ['stack'])
    }) // lỗi 500 // giấu cái lỗi stack đi
  } // omit sẽ loại bỏ cái lỗi có tên là status
}
