import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import voucherService from '~/services/vouchers.services'
import { getParam } from '~/utils/params'

export const listVouchersController = async (_req: Request, res: Response) => {
  const result = await voucherService.list()
  res.status(HTTP_STATUS.OK).json({ message: 'Get vouchers success', result })
}

export const createVoucherController = async (req: Request, res: Response) => {
  const result = await voucherService.create(req.body)
  res.status(HTTP_STATUS.CREATED).json({ message: 'Create voucher success', result })
}

export const updateVoucherController = async (req: Request, res: Response) => {
  const result = await voucherService.update(getParam(req, 'id'), req.body)
  res.status(HTTP_STATUS.OK).json({ message: 'Update voucher success', result })
}

export const deleteVoucherController = async (req: Request, res: Response) => {
  const result = await voucherService.remove(getParam(req, 'id'))
  res.status(HTTP_STATUS.OK).json({ message: 'Delete voucher success', result })
}

export const validateVoucherController = async (req: Request, res: Response) => {
  const result = await voucherService.validate(String(req.body.code || ''), Number(req.body.subtotal || 0))
  res.status(HTTP_STATUS.OK).json({ message: 'Validate voucher success', result })
}
