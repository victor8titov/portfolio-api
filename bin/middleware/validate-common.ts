import express, { NextFunction } from 'express'
import createError from 'http-errors'
import { query } from 'express-validator'
import { imageModel } from '../../app/models/image'
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

export async function checkImageIdsInDB (listId: (string | number)[]): Promise<boolean> {
  const format = (list: (string | number)[]): string[] => list.map(item => {
    if (typeof item === 'number') {
      return item.toString()
    }
    return item
  })
  const _listId = format(listId)
  const _listIdFromDatabase = format(await imageModel.getListId())

  return _listId.every(
    id => _listIdFromDatabase.some(_idFromDB => _idFromDB === id))
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
