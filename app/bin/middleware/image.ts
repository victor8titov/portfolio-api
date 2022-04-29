import { NextFunction, Request, Response } from 'express'
import { param } from 'express-validator'
import { imageModel } from '../../models/image'
import { validationErrorHandler } from './handler-error'
import createError from 'http-errors'
import { validatePagination } from './validate-common'

export const validateImage = [
  param('fileId', 'Param fileId is wrong').notEmpty().isString(),
  validationErrorHandler,
  isExistById
]

export const validateImages = [
  ...validatePagination,
  validationErrorHandler
]

async function isExistById (req: Request, res: Response, next: NextFunction) {
  try {
    const fileId = parseInt(req.params.fileId)
    const listImageIdFromDB = await imageModel.getListId()

    const checking = listImageIdFromDB.some(item => parseInt(item) === fileId)

    if (!checking) {
      return next(createError(400, 'Image with such Id does not found', { source: 'fileId' }))
    }

    next()
  } catch (e) {
    next(createError(500, "Error is during searching file's id"))
  }
}
