// dùng serving static file
// server sẽ gửi file có sẵn cho client
import { error } from 'console'
import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  // lấy ra filename từ req params
  // vd: http://localhost:3000/static/:filename
  const { filename } = req.params
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, filename), (error) => {
    if (error) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'File not found'
      })
    }
  })
}
