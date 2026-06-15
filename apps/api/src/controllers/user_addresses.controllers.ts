import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { ADDRESS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { UserAddressInput } from '~/models/requests/UserAddresses.requests'
import { TokenPayload } from '~/models/requests/Users.requests'
import userAddressService from '~/services/user_addresses.services'

function validateAddressPayload(body: UserAddressInput, partial = false) {
  if (!partial || body.recipient_name !== undefined) {
    if (!body.recipient_name?.trim()) {
      throw new ErrorWithStatus({
        message: ADDRESS_MESSAGES.RECIPIENT_NAME_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
  }
  if (!partial || body.phone !== undefined) {
    if (!body.phone?.trim()) {
      throw new ErrorWithStatus({
        message: ADDRESS_MESSAGES.PHONE_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
  }
  if (!partial || body.address_line !== undefined) {
    if (!body.address_line?.trim()) {
      throw new ErrorWithStatus({
        message: ADDRESS_MESSAGES.ADDRESS_LINE_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
  }
  if (!partial || body.lat !== undefined || body.lng !== undefined) {
    const lat = Number(body.lat)
    const lng = Number(body.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new ErrorWithStatus({
        message: ADDRESS_MESSAGES.INVALID_COORDINATES,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
  }
}

export const getSavedAddressesController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const addresses = await userAddressService.listByUserId(user_id)
  res.status(HTTP_STATUS.OK).json({
    message: ADDRESS_MESSAGES.GET_ADDRESSES_SUCCESS,
    result: addresses
  })
}

export const createSavedAddressController = async (
  req: Request<ParamsDictionary, unknown, UserAddressInput>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  validateAddressPayload(req.body)
  const address = await userAddressService.create(user_id, req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: ADDRESS_MESSAGES.CREATE_ADDRESS_SUCCESS,
    result: address
  })
}

export const updateSavedAddressController = async (
  req: Request<ParamsDictionary, unknown, Partial<UserAddressInput>>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const address_id = req.params.id as string
  validateAddressPayload(req.body as UserAddressInput, true)
  const address = await userAddressService.update(user_id, address_id, req.body)
  res.status(HTTP_STATUS.OK).json({
    message: ADDRESS_MESSAGES.UPDATE_ADDRESS_SUCCESS,
    result: address
  })
}

export const deleteSavedAddressController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const address_id = req.params.id as string
  await userAddressService.delete(user_id, address_id)
  res.status(HTTP_STATUS.OK).json({
    message: ADDRESS_MESSAGES.DELETE_ADDRESS_SUCCESS
  })
}
