import { param } from 'express-validator'
import { validationErrorHandler } from './handler-error'

export const validate = [
  param('fileId', 'Param fileId is wrong').notEmpty().isString().isLength({ max: 10 }),
  validationErrorHandler
]
