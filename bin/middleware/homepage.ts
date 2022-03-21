import express, { NextFunction, RequestHandler } from 'express'
import escape from 'validator/lib/escape'
import { body, ValidationChain } from 'express-validator'
import { validateLanguage } from './validate-common'
import { repeatCheck } from '../common/check-repeat'
import { AvatarRequest } from '../../app/models/homepage'
import { getListImagesId } from '../../app/models/image'
import createError from 'http-errors'

export function validate (method: string): (ValidationChain | RequestHandler)[] {
  switch (method) {
    case 'read': {
      return [
        ...validateLanguage
      ]
    }
    case 'create': {
      return [
        ...validateBody,
        validateImagesId
      ]
    }
    case 'update': {
      return [
        ...validateBody,
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
          item.imageId.length < 11)
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
    const imagesId = avatars.map((i: AvatarRequest) => i.imageId)
    if (!imagesId) return next()

    const _imagesIdFromDatabase = await getListImagesId()

    const _checkImagesId = imagesId.every(
      (_img: string) => _imagesIdFromDatabase.some(_imgFromDB => _imgFromDB === _img))
    if (!_checkImagesId) {
      return next(createError(400, 'Some from list images id is wrong', { source: 'imagesId' }))
    }

    next()
  } catch (e) {
    next(createError(500, 'Error is during validate images ID'))
  }
}