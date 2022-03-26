import express, { NextFunction, RequestHandler } from 'express'
import { body, ValidationChain, param } from 'express-validator'
import createError from 'http-errors'
import { getListImagesId } from '../../app/models/image'
import { getListIdSocialMedia } from '../../app/models/social-media'
import { validationErrorHandler } from './handler-error'

export function validate (method: 'create' | 'update' | 'delete'): (ValidationChain | RequestHandler)[] {
  switch (method) {
    case 'create': {
      return [
        ...validateBody,
        validationErrorHandler,
        validateImageId
      ]
    }
    case 'update': {
      return [
        ...validateId,
        ...validateBody,
        validationErrorHandler,
        isExistById,
        validateImageId
      ]
    }
    case 'delete': {
      return [
        ...validateId,
        validationErrorHandler,
        isExistById
      ]
    }
    default: {
      return []
    }
  }
}

const validateBody = [
  body('name', 'Name is required').trim().escape().notEmpty().bail()
    .isLength({ max: 30 })
    .withMessage('Name can be not more 30'),
  body('link').trim().notEmpty().bail()
    .isLength({ max: 100 })
    .withMessage('Name can be not more 100'),
  body('imageId', 'imageId can be string not more 10 character')
    .optional().trim().isString().isLength({ max: 10 })
]

const validateId = [
  param('socialMediaId', 'Param socialMediaId is wrong').notEmpty().isInt()
]

async function isExistById (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const socialMediaId = parseInt(req.params.socialMediaId)
    const _mediaSocialListIdFromDB = await getListIdSocialMedia()

    const isExist = _mediaSocialListIdFromDB.some(item => parseInt(item) === socialMediaId)

    if (!isExist) {
      return next(createError(400, 'Social media with such Id does not found', { source: 'socialMediaId' }))
    }

    next()
  } catch (e) {
    next(createError(500, "Error is during searching skill's id"))
  }
}

async function validateImageId (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const imageId = req.body.imageId
    if (!imageId) return next()

    const _imagesIdFromDatabase = await getListImagesId()

    const _checkImagesId = _imagesIdFromDatabase.some(_imgFromDB => parseInt(_imgFromDB) === parseInt(imageId))
    if (!_checkImagesId) {
      return next(createError(400, "Image's id  is wrong", { source: 'imageId' }))
    }

    next()
  } catch (e) {
    next(createError(500, 'Error is during validate images ID'))
  }
}
