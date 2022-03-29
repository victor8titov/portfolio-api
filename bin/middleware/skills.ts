import express, { NextFunction, RequestHandler } from 'express'
import escape from 'validator/lib/escape'
import { body, ValidationChain, param } from 'express-validator'
import createError from 'http-errors'
import { validateLanguage, validateLanguageFromDescription } from './validate-common'
import { validationErrorHandler } from './handler-error'
import { skillModel } from '../../app/models/skills'

export function validate (method: 'getSkills' | 'getById' | 'create' | 'update' | 'delete'): (ValidationChain | RequestHandler)[] {
  switch (method) {
    case 'getSkills': {
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
        validateLanguageFromDescription,
        validateName
      ]
    }
    case 'update': {
      return [
        ...validateId,
        ...validateBody,
        validationErrorHandler,
        isExistById,
        validateName,
        validateLanguageFromDescription
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
  body('name').trim().escape().isLength({ max: 100 }),
  body('group', 'Field group is longer than 30 character').optional().trim().isLength({ max: 30 }),
  body('level').optional().isInt().default(0).custom(value => value >= 0 && value <= 10),
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
  param('skillId', 'Param skillId is wrong').notEmpty().isInt()
]

async function validateName (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const skillId: string | number = req.params.skillId || ''
    const _nameFromDB = await skillModel.getSkillName()

    const _checkName = _nameFromDB.some(
      item => item.name === req.body.name && item.id?.toString() !== skillId?.toString())

    if (_checkName) {
      return next(createError(400, 'Skill with such name is exist.', { source: 'name' }))
    }

    next()
  } catch (e) {
    next(createError(500, 'Error is during validate Name'))
  }
}

async function isExistById (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const skillId: string | number = req.params.skillId
    const idFromDB = await skillModel.getSkillName()

    const isExist = idFromDB.some(item => item.id?.toString() === skillId.toString())

    if (!isExist) {
      return next(createError(400, 'Skill with such Id does not found', { source: 'skillId' }))
    }

    next()
  } catch (e) {
    next(createError(500, "Error is during searching skill's id"))
  }
}
