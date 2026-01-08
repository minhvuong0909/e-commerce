import { checkSchema, ParamSchema } from 'express-validator'
import { BRANDS_MESSAGES } from '~/constants/messages'
import { REGEX_PHONE_NUMBER } from '~/constants/regex'
import { validate } from '~/utils/validations'

const nameBrandSchema: ParamSchema = {
  notEmpty: {
    errorMessage: BRANDS_MESSAGES.BRAND_NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: BRANDS_MESSAGES.BRAND_NAME_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: BRANDS_MESSAGES.BRAND_NAME_LENGTH_MUST_BE_FROM_1_TO_100
  }
}

const hotlineBrandSchema: ParamSchema = {
  notEmpty: {
    errorMessage: BRANDS_MESSAGES.HOTLINE_IS_REQUIRED
  },
  isString: {
    errorMessage: BRANDS_MESSAGES.HOTLINE_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 10
    },
    errorMessage: BRANDS_MESSAGES.HOTLINE_LENGTH_MUST_BE_FROM_1_TO_10
  },
  custom: {
    options: (value: string) => {
      return REGEX_PHONE_NUMBER.test(value)
    },
    errorMessage: BRANDS_MESSAGES.HOTLINE_IS_INVALID
  }
}

export const addressSchema: ParamSchema = {
  notEmpty: {
    errorMessage: BRANDS_MESSAGES.ADDRESS_IS_REQUIRED
  },
  isString: {
    errorMessage: BRANDS_MESSAGES.ADDRESS_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 200
    },
    errorMessage: BRANDS_MESSAGES.ADDRESS_LENGTH_MUST_BE_LESS_THAN_200
  }
}

const descBrandSchema: ParamSchema = {
  notEmpty: {
    errorMessage: BRANDS_MESSAGES.BRAND_DESC_IS_REQUIRED
  },
  isString: {
    errorMessage: BRANDS_MESSAGES.BRAND_DESC_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 300
    },
    errorMessage: BRANDS_MESSAGES.CATEGORY_DESC_LENGTH_MUST_BE_FROM_1_TO_300
  }
}
export const createBrandValidator = validate(
  checkSchema({
    name: nameBrandSchema,
    hotline: hotlineBrandSchema,
    address: addressSchema,
    desc: descBrandSchema
  })
)
