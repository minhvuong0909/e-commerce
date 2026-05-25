import { Request, Response, NextFunction } from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import HTTP_STATUS from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Errors'
// validate này sẽ kiểm tra đầu vào
export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // lôi thằng checkSchema ra để lấy danh sách lỗi
    await validations.run(req) // function cũng lấy lỗi từ request
    const errors = validationResult(req) // lập danh sách lỗi trong request
    if (errors.isEmpty()) {
      return next()
    }
    const errorObject = errors.mapped() // làm gián tiếp vì
    const entityError = new EntityError({ errors: {} }) // vì ban đầu nó k có lỗi
    // duyệt key
    for (const key in errorObject) {
      const { msg } = errorObject[key] // lấy ra msg trong mỗi thuộc tính
      // nếu có nội dung lỗi nào mà giống nội dung ErrorWithStatus hoặc là có mã khác 422
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg) // đưa cái lỗi cho thak tổng
      }
      // những lỗi là 422 sẽ đc nhét vào entityError
      entityError.errors[key] = errorObject[key].msg
    }

    next(entityError)
  }
}
