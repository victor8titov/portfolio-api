import express, { NextFunction, RequestHandler } from 'express'
import escape from 'validator/lib/escape'
import { body, ValidationChain, query, param } from 'express-validator'
import createError from 'http-errors'
import { getLanguages } from '../../app/models/language'
import { getNameProjects, ProjectStatuses } from '../../app/models/project'
import { validateImagesId, validateLanguage, validateLanguageFromDescription, validatePagination } from './validate-common'
import { repeatCheck } from '../common/check-repeat'
import { validationErrorHandler } from './handler-error'

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
        validationErrorHandler
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
        validateLanguageFromDescription,
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
  body('group').optional().trim().isLength({ max: 30 }),
  body('level').optional().isInt().default(0).custom(value => value >= 0 && value <= 10),
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

// TODO need to write method for getting name list from database
async function validateName (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const skillId: string | number = req.params.skillId ?? -1
    const _namesOfExistSkills = // спрашиваем список имен

    const _checkName = _namesOfExistSkills.some(
      item => item.name === req.body.name && parseInt(item.id) !== parseInt(skillId))

    if (_checkName) {
      return next(createError(400, 'Skill with such name is exist.', { source: 'name' }))
    }

    next()
  } catch (e) {
    next(createError(500, 'Error is during validate Name'))
  }
}

// TODO need to add methods from database
async function isExistById (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const skillId = parseInt(req.params.skillId)
    const _skillsFromDatabase = // method getting name and id list from database

    const _checking = _skillsFromDatabase.some(item => parseInt(item.id) === skillId)

    if (!_checking) {
      return next(createError(400, 'Skill with such ID does not found', { source: 'skillId' }))
    }

    next()
  } catch (e) {
    next(createError(500, "Error is during searching skill's id"))
  }
}
