import express, { NextFunction } from 'express'
import createError from 'http-errors'
import { query } from 'express-validator'
import { getListImagesId } from '../../app/models/image'
import { Language } from '../../app/models/types'
import { getLanguages } from '../../app/models/language'

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

export async function validateLanguageFromDescription (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    /* Check languages used in the request */
    const _useLanguages: string[] | undefined = req.body.description ? Object.keys(req.body.description) : undefined

    if (_useLanguages) {
      const _supportedLanguages = await getLanguages()

      const _checkingLanguages =
        _useLanguages.every(_lang => _supportedLanguages.some(
          _supportedLang => _supportedLang === _lang))

      if (!_checkingLanguages) {
        const _message = `The language is incorrect in the field description, possible ${_supportedLanguages.join(', ')}`
        return next(createError(400, _message, { source: 'description' }))
      }
    }

    next()
  } catch (e) {
    next(createError(500, 'Error is during check languages in description'))
  }
}
