export function formatImageUrl(url?: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')
  const cleanPath = url.startsWith('/') ? url : `/${url}`
  return `${apiBase}${cleanPath}`
}
