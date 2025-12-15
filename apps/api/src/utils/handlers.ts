import { Request, Response, NextFunction, RequestHandler } from 'express'
// file này chứa hàm có tên là wrapAsync
// wrapAsync là 1 hàm nhận vào async request handler
// và nó tạo ra cấu trúc try catch next cho async request handler
// từ đó async request handler có thể throw thoải mái mà k cần try catch next gì cả

export const wrapAsync = <P, T>(func: RequestHandler<P, any, any, T>) => {
  return async (req: Request<P, any, any, T>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
