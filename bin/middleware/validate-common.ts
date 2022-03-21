import express, { NextFunction } from 'express'
import createError from 'http-errors'
import { query } from 'express-validator'
import { getListImagesId } from '../../app/models/image'
import { Language } from '../../bin/database/types'

export const validateLanguage = [
  query('language', 'Query language is wrong, it can be string and length 5')
    .default(Language.EN)
    .isString()
    .isLength({ max: 5 }),
  query('language', `The language is incorrect, possible ${Object.values(Language).join(', ')}.`)
    .custom(value => Object.values(Language).some(i => i.toLowerCase() === value.toLowerCase()))
]

export const validatePagination = [
  query('page').optional(),
  query('pageSize').optional()
]

export async function validateImagesId (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const imagesId = req.body.imagesId
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
