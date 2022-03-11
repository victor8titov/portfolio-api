import { NextFunction } from 'express'
import multer from 'multer'
import createError from 'http-errors'
import { TypeErrors } from '../database/types'
import path from 'path'
import { regExpCheckImages, supportedExtensionImages } from '../common/extensions-image'

export const fieldsForUpload = [
  { name: 'name', maxCount: 1 },
  { name: 'description', maxCount: 1 },
  { name: 'file', maxCount: 1 }
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

    if (!files || !Array.isArray(files)) next(createError(400, 'Incorrect request', { type: TypeErrors.EMPTY_FILED, source: 'Field file' }))
    if (files.length > 1) next(createError(400, 'Incorrect request', { type: TypeErrors.INCORRECT_VALUE, source: 'Field file' }))

    const _file: Express.Multer.File = files.shift()
    const { ext, name } = path.parse(_file.originalname)

    if (!regExpCheckImages.test(ext)) {
      return next(createError(
        400,
        `Does not support this extension. Support next ${supportedExtensionImages.join(', ')}`,
        { source: 'Extension', type: TypeErrors.EXTENTSION }
      ))
    }

    req.file = _file

    if (req.body.name) {
      req.name = req.body.name
    } else {
      req.name = name
    }

    req.description = req.body.description || null

    next()
  })
}
