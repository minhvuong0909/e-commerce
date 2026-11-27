import { Request } from 'express'
import { badRequest } from './security'

/**
 * Read a single route param as a string.
 * Express 5 types params as `string | string[]` (wildcard segments); our routes only use plain
 * `:name` segments, so an array or empty value means a malformed request.
 */
export function getParam(req: Pick<Request, 'params'>, name: string): string {
  const value = (req.params as Record<string, string | string[] | undefined>)[name]
  if (typeof value !== 'string' || value.length === 0) badRequest(`Thiếu tham số ${name}.`)
  return value
}
