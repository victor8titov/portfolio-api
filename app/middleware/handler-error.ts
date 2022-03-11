import { Request, Response, NextFunction } from 'express'
import { HttpError } from 'http-errors'

export function handlerError (err: HttpError, req: Request, res: Response, next: NextFunction) {
  res.status(err.status || 500).json({
    ...(err.source ? { source: err.source } : {}),
    ...(err.type ? { type: err.type } : {}),
    message: err.message || 'Internal Server Error'
  })
}
