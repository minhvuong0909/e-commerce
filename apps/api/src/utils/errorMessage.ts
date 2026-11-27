/** Safe message extraction for `catch (error: unknown)` blocks. */
export function getErrorMessage(error: unknown, fallback = ''): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') return error.message
  return fallback
}
