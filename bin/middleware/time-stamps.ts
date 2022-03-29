import express, { NextFunction, RequestHandler } from 'express'
import escape from 'validator/lib/escape'
import { body, ValidationChain, param } from 'express-validator'
import createError from 'http-errors'
import { validateEvents, validateLanguage, validateLanguageFromDescription } from './validate-common'
import { validationErrorHandler } from './handler-error'
import { timeStampModel } from '../../app/models/time-stamps'

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
  body('events', 'Event is required').notEmpty(),
  ...validateEvents,
  body('events', 'Missing statuses start and end')
    .custom(value => {
      const _statuses = value.map((i: any) => i.status)

      if (!_statuses.some((i: string) => i === 'start')) return false
      if (!_statuses.some((i: string) => i === 'end')) return false
      return true
    }),
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
    const timeStampId = req.params.timeStampId?.toString()
    const _timeStampListId = await timeStampModel.getNamesAndId()

    const isExist = _timeStampListId.some(item => item.id?.toString() === timeStampId)

    if (!isExist) {
      return next(createError(400, 'Time stamp with such Id does not found', { source: 'timeStampId' }))
    }

    next()
  } catch (e) {
    next(createError(500, "Error is during searching time stamp's id"))
  }
}
