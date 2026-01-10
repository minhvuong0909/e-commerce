// import { Request } from 'express'
// import { ParamSchema } from 'express-validator'
// import { CART_MESSAGES } from '~/constants/messages'
// import databaseService from '~/services/database.service'
// import { ObjectId } from 'mongodb'

// export const quantityCartItem: ParamSchema = {
//   notEmpty: {
//     errorMessage: CART_MESSAGES.QUANTITY_IS_REQUIRED
//   },
//   isNumeric: {
//     errorMessage: CART_MESSAGES.QUANTITY_MUST_BE_A_NUMBER
//   },
//   custom: {
//     options: async (value: string, req: Request) => {
//         const stock = await databaseService.products.findOne({ _id: new ObjectId(req.body.product_id) })
//         if ()
//     }
//   },
// }
