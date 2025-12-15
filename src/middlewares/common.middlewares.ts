// file này dùng để filter các property mà người dùng truyền lên để update

import { NextFunction, Request, Response } from 'express'
import { pick } from 'lodash'

//FilterKeys là mảng các key của object T nào đó
type FilterKeys<T> = Array<keyof T>

export const filterMiddleware =
  // generic sẽ truyền vào object mình cần update
  <T>(filterKey: FilterKeys<T>) =>
    (req: Request, res: Response, next: NextFunction) => {
      // midddleware này sẽ mod lại req.body bằng những filterkeys đã liệt kê
      ;(req as any).body = pick(req.body, filterKey)
      next()
    }
