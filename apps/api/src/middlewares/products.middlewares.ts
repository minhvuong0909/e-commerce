import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { PRODUCTS_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validations'

export const createProductValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: PRODUCTS_MESSAGES.NAME_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_NAME_LENGTH
        }
      },
      quantity: {
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.QUANTITY_IS_REQUIRED
        },
        isInt: {
          options: { min: 0 },
          errorMessage: PRODUCTS_MESSAGES.QUANTITY_MUST_BE_NON_NEGATIVE
        }
      },
      price: {
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.PRICE_IS_REQUIRED
        },
        isFloat: {
          options: { min: 0 },
          errorMessage: PRODUCTS_MESSAGES.PRICE_MUST_BE_NON_NEGATIVE
        }
      },
      description: {
        optional: true,
        notEmpty: undefined,
        isString: {
          errorMessage: PRODUCTS_MESSAGES.DESCRIPTION_MUST_BE_STRING
        },
        trim: true
      },
      origin: {
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.ORIGIN_IS_REQUIRED
        },
        isString: {
          errorMessage: PRODUCTS_MESSAGES.ORIGIN_MUST_BE_STRING
        }
      },

      volume: {
        optional: true,
        notEmpty: undefined,
        isFloat: {
          options: { min: 0 },
          errorMessage: PRODUCTS_MESSAGES.VOLUME_MUST_BE_NON_NEGATIVE
        }
      },

      weight: {
        optional: true,
        notEmpty: undefined,
        isFloat: {
          options: { min: 0 },
          errorMessage: PRODUCTS_MESSAGES.WEIGHT_MUST_BE_NON_NEGATIVE
        }
      },

      width: {
        optional: true,
        notEmpty: undefined,
        isFloat: {
          options: { min: 0 },
          errorMessage: PRODUCTS_MESSAGES.WIDTH_MUST_BE_NON_NEGATIVE
        }
      },

      height: {
        optional: true,
        notEmpty: undefined,
        isFloat: {
          options: { min: 0 },
          errorMessage: PRODUCTS_MESSAGES.HEIGHT_MUST_BE_NON_NEGATIVE
        }
      },

      images: {
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.IMAGES_IS_REQUIRED
        }
      },

      category_id: {
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.CATEGORY_ID_IS_REQUIRED
        },
        custom: {
          options: (value) => ObjectId.isValid(value),
          errorMessage: PRODUCTS_MESSAGES.INVALID_CATEGORY_ID
        }
      },

      status: {
        optional: true
      }
    },
    ['body']
  )
)
