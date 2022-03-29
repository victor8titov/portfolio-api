import express, { NextFunction } from 'express'
import createError from 'http-errors'
import moment from 'moment'
import { body, query } from 'express-validator'
import { imageModel } from '../../app/models/image'
import { EventAndDate, Language } from '../../app/models/types'
import { languageModel } from '../../app/models/language'
import { repeatCheck } from '../common/check-repeat'
import { defaultValue } from '../config/default-settings'

export const validateLanguage = [
  query('language', 'Query language is wrong, it can be string and length 5')
    .default(Language.EN)
    .isString()
    .isLength({ max: 5 }),
  query('language', `The language is incorrect, possible ${Object.values(Language).join(', ')}.`)
    .custom(value => Object.values(Language).some(i => i.toLowerCase() === value.toLowerCase()))
]

export const validatePagination = [
  query('page').optional().default(defaultValue.page),
  query('pageSize').optional().default(defaultValue.pageSize)
]

export const validateEvents = [
  body('events')
    .optional()
    .default([])
    .custom(value => Array.isArray(value) &&
      value.every((item: any) =>
        item.date &&
        item.status &&
        typeof item.date === 'string' &&
        typeof item.status === 'string' &&
        item.status.length <= 20))
    .custom(value => value.every((i: EventAndDate) => moment(i.date).isValid()))
    .withMessage('Not a valid presentation of the date')
    .custom(value => !repeatCheck(value.map((i: EventAndDate) => i.status)))
    .withMessage('Uses repeated statuses')
    .customSanitizer(value =>
      value?.map((i: EventAndDate) => ({ date: moment(i.date).toISOString(), status: i.status })))
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
      const _supportedLanguages = await languageModel.getAll()

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
