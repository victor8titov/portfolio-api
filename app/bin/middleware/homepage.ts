import express, { NextFunction, RequestHandler } from 'express'
import escape from 'validator/lib/escape'
import { body, ValidationChain } from 'express-validator'
import { checkImageIdsInDB, validateLanguage } from './validate-common'
import { repeatCheck } from '../common/check-repeat'
import { AvatarCreation } from '../../models/homepage'
import createError from 'http-errors'
import { validationErrorHandler } from './handler-error'

export function validate (method: 'read' | 'create' | 'update'): (ValidationChain | RequestHandler)[] {
  switch (method) {
    case 'read': {
      return [
        ...validateLanguage,
        validationErrorHandler
      ]
    }
    case 'create': {
      return [
        ...validateBody,
        validationErrorHandler,
        validateImagesId
      ]
    }
    case 'update': {
      return [
        ...validateBody,
        validationErrorHandler,
        validateImagesId
      ]
    }
    default: {
      return []
    }
  }
}

const validateBody = [
  body('title', 'Field title is not valid').optional().custom(customFormat),
  body('subtitle', 'Field subtitle is not valid').optional().custom(customFormat),
  body('description', 'Field description is not valid').optional().custom(customFormat),
  body('avatars', 'Wrong object avatars')
    .optional()
    .custom((value) => Array.isArray(value) &&
      value.every(
        (item) => item &&
          typeof item === 'object' &&
          item.type &&
          item.type.length < 11 &&
          item.imageId &&
          (typeof item.imageId === 'string' ||
          typeof item.imageId === 'number'))
    )
    .custom((value) => {
      const values = value.map((i: { type: string }) => i.type)
      return !repeatCheck(values)
    })
]

function customFormat (value: any) {
  if (typeof value === 'object') {
    for (const key in value) {
      value[key] = escape(value[key])
    }
    return value
  }
  if (typeof value === 'string') {
    return {
      en: escape(value)
    }
  }
  return false
}

async function validateImagesId (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { avatars } = req.body
    if (!avatars) return next()

    const imagesId: string[] = avatars.map((i: AvatarCreation) => i.imageId)
    if (!imagesId) return next()

    if (!await checkImageIdsInDB(imagesId)) {
      return next(createError(400, 'Some from list images id is wrong', { source: 'imagesId' }))
    }

    next()
  } catch (e) {
    next(createError(500, 'Error is during validate images ID'))
  }
}
