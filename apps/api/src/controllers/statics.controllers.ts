// dùng serving static file
// server sẽ gửi file có sẵn cho client
import { error } from 'console'
import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import mime from 'mime-types'
import fs from 'fs'

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  // lấy ra filename từ req params
  // vd: http://localhost:3000/static/:filename
  const { filename } = (req.params as any)
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, filename), (error) => {
    if (error) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'File not found'
      })
    }
  })
}

export const serveVideoController = (req: Request, res: Response) => {
  const { filename } = (req.params as any)

  if (!filename) {
    return res.status(400).json({
      message: 'Filename is required',
      error: 'Missing namefile parameter'
    })
  }

  const sanitizedName = path.basename(filename)
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, sanitizedName)

  // check video path có nằm trong upload_video_dir ?
  if (!videoPath.startsWith(path.resolve(UPLOAD_VIDEO_DIR))) {
    return res.status(403).json({
      message: 'Access denied',
      error: 'Invalid file path'
    })
  }

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({
      message: 'Video not found',
      error: `File ${sanitizedName} does not exist`
    })
  }

  const videoSize = fs.statSync(videoPath).size
  const range = req.headers.range

  // Xác định Content-Type
  const ext = path.extname(sanitizedName).toLowerCase()
  const contentType =
    ext === '.mp4' ? 'video/mp4' : ext === '.webm' ? 'video/webm' : ext === '.ogg' ? 'video/ogg' : 'video/mp4'

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp'
  }

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders)
    res.end()
    return
  }

  // NO RANGE REQUEST
  if (!range) {
    res.writeHead(200, {
      ...corsHeaders,
      'Content-Length': videoSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600'
    })

    const stream = fs.createReadStream(videoPath)
    stream.on('error', (error) => {
      console.error('Stream error:', error)
      if (!res.headersSent) {
        res.sendStatus(500)
      }
    })
    stream.pipe(res)
    return
  }

  // RANGE REQUEST
  const CHUNK_SIZE = 1 * 1024 * 1024
  const match = range.match(/bytes=(\d+)-(\d*)/)

  if (!match) {
    res.writeHead(416, {
      ...corsHeaders,
      'Content-Range': `bytes */${videoSize}`
    })
    res.end()
    return
  }

  const start = Number(match[1])
  const end = match[2] ? Number(match[2]) : Math.min(start + CHUNK_SIZE - 1, videoSize - 1)

  // Validate range
  if (start >= videoSize || end >= videoSize || start > end) {
    res.writeHead(416, {
      ...corsHeaders,
      'Content-Range': `bytes */${videoSize}`
    })
    res.end()
    return
  }

  const contentLength = end - start + 1

  res.writeHead(206, {
    ...corsHeaders,
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=3600'
  })

  const stream = fs.createReadStream(videoPath, { start, end })

  stream.on('error', (error) => {
    console.error('Stream error:', error)
    if (!res.headersSent) {
      res.sendStatus(500)
    }
  })

  stream.pipe(res)
}
