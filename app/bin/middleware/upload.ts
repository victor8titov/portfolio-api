import { NextFunction } from 'express'
import { body } from 'express-validator'
import multer from 'multer'
import createError from 'http-errors'
import path from 'path'
import { regExpCheckImages, supportedExtensionImages } from '../common/extensions-image'
import { TypeErrors } from '../../models/types'
import { validationErrorHandler } from './handler-error'

export const validateUpload = [
  body('name').optional().trim().escape().isLength({ max: 100 }),
  body('description').optional().trim().escape().default('').isLength({ max: 300 }),
  validationErrorHandler
]

const _upload = multer().any()

// TODO сложности надо разрулить типизацию
export function uploadImage (req: any, res: any, next: NextFunction) {
  _upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return next(createError(400, err.message, { type: err.code, source: err.field }))
    } else if (err) {
      return next(createError(500))
    }

    const { files } = req

    if (!files || !Array.isArray(files)) {
      next(createError(400, 'Incorrect request', { type: TypeErrors.EMPTY_FILED, source: 'Field file' }))
    }

    if (files.length > 1) {
      next(createError(400, 'Incorrect request', { type: TypeErrors.INCORRECT_VALUE, source: 'Field file' }))
    }

    const _file: Express.Multer.File = files.shift()

    if (!_file) {
      return next(createError(
        400,
        'Incorrect request',
        { type: TypeErrors.EMPTY_FILED, source: 'Field file' }
      ))
    }

    const { ext, name } = path.parse(_file.originalname)
    if (!req.body.name) req.body.name = name

    if (!regExpCheckImages.test(ext)) {
      return next(createError(
        400,
        `Does not support this extension. Support next ${supportedExtensionImages.join(', ')}`,
        { source: 'Extension', type: TypeErrors.EXTENTSION }
      ))
    }

    req.body.file = _file
    next()
  })
}
