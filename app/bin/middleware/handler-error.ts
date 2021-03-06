import { Request, Response, NextFunction } from 'express'
import { Result, ValidationError, validationResult } from 'express-validator'
import { ErrorBody } from '../../models/types'

export function validationErrorHandler (req: Request, res: Response, next: NextFunction) {
  const errors: Result<ValidationError> = validationResult(req)

  errors.isEmpty() ? next() : next(errors)
}

export function errorHandler (err: any, req: Request, res: Response, next: NextFunction) {
  const json: { errors: ErrorBody[] } = { errors: [] }

  if (err instanceof Result) {
    json.errors = err.array().map((_error) => ({ message: _error.msg, source: _error.param }))
    return res.status(400).json(json)
  } else {
    json.errors.push(
      {
        message: err.message || 'Internal Server Error',
        ...(err.source ? { source: err.source } : {}),
        ...(err.type ? { type: err.type } : {})
      }
    )
    return res.status(err.status || 500).json(json)
  }
}
