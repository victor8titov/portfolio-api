import express, { NextFunction, RequestHandler } from 'express'
import escape from 'validator/lib/escape'
import { body, ValidationChain, param } from 'express-validator'
import createError from 'http-errors'
import moment from 'moment'
import { validateLanguage, validateLanguageFromDescription } from './validate-common'
import { validationErrorHandler } from './handler-error'
import { repeatCheck } from '../common/check-repeat'
import { EventAndDate } from '../../app/models/types'
import { getNamesAndIdTimeStamps } from '../../app/models/time-stamps'

export function validate (method: 'getAll' | 'getById' | 'create' | 'update' | 'deleteById'): (ValidationChain | RequestHandler)[] {
  switch (method) {
    case 'getAll': {
      return [
        ...validateLanguage,
        validationErrorHandler
      ]
    }
    case 'getById': {
      return [
        ...validateId,
        ...validateLanguage,
        validationErrorHandler,
        isExistById
      ]
    }
    case 'create': {
      return [
        ...validateBody,
        validationErrorHandler,
        validateLanguageFromDescription
      ]
    }
    case 'update': {
      return [
        ...validateId,
        ...validateBody,
        validationErrorHandler,
        isExistById,
        validateLanguageFromDescription
      ]
    }
    case 'deleteById': {
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
  body('name').notEmpty().trim().escape().isLength({ max: 100 }),
  body('link').optional().trim().isString(),
  body('events', 'Events is required')
    .notEmpty()
    .bail()
    .custom(value => Array.isArray(value) &&
      value.every((item: any) =>
        item.date &&
        item.status &&
        typeof item.date === 'string' &&
        typeof item.status === 'string' &&
        item.status.length <= 20))
    .custom(value => value.every((i: EventAndDate) => moment(i.date).isValid()))
    .withMessage('Not a valid presentation of the date')
    .custom(value => {
      const _statuses = value.map((i: any) => i.status)

      if (!_statuses.some((i: string) => i === 'start')) return false
      if (!_statuses.some((i: string) => i === 'end')) return false
      return true
    })
    .withMessage('Missing statuses start and end')
    .custom(value => !repeatCheck(value.map((i: EventAndDate) => i.status)))
    .withMessage('Uses repeated statuses')
    .customSanitizer(value =>
      value.map((i: EventAndDate) => ({ date: moment(i.date).toISOString(), status: i.status }))),
  body('description').optional().customSanitizer(value => typeof value === 'string' ? { en: value } : value),
  body('description', 'Field description is not valid').optional().custom(value => {
    if (typeof value !== 'object') return false
    for (const key in value) {
      value[key] = escape(value[key])
    }
    return value
  })
]

const validateId = [
  param('timeStampId', 'Param timeStampId is wrong').notEmpty().isInt()
]

async function isExistById (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const timeStampId = parseInt(req.params.timeStampId)
    const _timeStampListId = await getNamesAndIdTimeStamps()

    const isExist = _timeStampListId.some(item => parseInt(item.id) === timeStampId)

    if (!isExist) {
      return next(createError(400, 'Time stamp with such Id does not found', { source: 'timeStampId' }))
    }

    next()
  } catch (e) {
    next(createError(500, "Error is during searching time stamp's id"))
  }
}
