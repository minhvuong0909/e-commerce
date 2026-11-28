import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import dashboardService, { dayKey } from '~/services/dashboard.services'
import { badRequest } from '~/utils/security'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const MAX_RANGE_DAYS = 366
const DEFAULT_RANGE_DAYS = 30

/** Validate ?from=YYYY-MM-DD&to=YYYY-MM-DD (shop timezone). Defaults to the last 30 days. */
export function parseRange(query: Record<string, unknown>, now = new Date()) {
  const to = typeof query.to === 'string' && query.to ? query.to : dayKey(now)
  const from =
    typeof query.from === 'string' && query.from
      ? query.from
      : dayKey(new Date(new Date(`${to}T12:00:00+07:00`).getTime() - (DEFAULT_RANGE_DAYS - 1) * 86_400_000))

  if (!DATE_RE.test(from) || !DATE_RE.test(to)) badRequest('Ngày phải có dạng YYYY-MM-DD.')
  const start = new Date(`${from}T00:00:00+07:00`)
  const end = new Date(`${to}T00:00:00+07:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || dayKey(start) !== from || dayKey(end) !== to)
    badRequest('Ngày không hợp lệ.')
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1
  if (days < 1) badRequest('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.')
  if (days > MAX_RANGE_DAYS) badRequest(`Khoảng thời gian tối đa ${MAX_RANGE_DAYS} ngày.`)
  return { from, to }
}

export const getDashboardSummaryController = async (req: Request, res: Response) => {
  const { from, to } = parseRange(req.query as Record<string, unknown>)
  const result = await dashboardService.getSummary(from, to)
  res.status(HTTP_STATUS.OK).json({ message: 'Get dashboard summary success', result })
}
