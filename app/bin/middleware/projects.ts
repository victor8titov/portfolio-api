import express, { NextFunction, RequestHandler } from 'express'
import escape from 'validator/lib/escape'
import { body, ValidationChain, query, param } from 'express-validator'
import createError from 'http-errors'
import { projectModel } from '../../models/project'
import { checkImageIdsInDB, validateEvents, validateLanguage, validateLanguageFromDescription, validatePagination } from './validate-common'
import { repeatCheck } from '../common/check-repeat'
import { validationErrorHandler } from './handler-error'
import { LinkCreation } from '../../models/types'

export function validate (method: 'create' | 'getById' | 'getByIdMultilingual' | 'getProjects' | 'put' | 'delete'): (ValidationChain | RequestHandler)[] {
  switch (method) {
    case 'create': {
      return [
        ...validateBody,
        validationErrorHandler,
        validateLanguageFromDescription,
        validateName,
        validateImagesId,
        validateLinksImagesId
      ]
    }
    case 'getById': {
      return [
        ...validateId,
        ...validateLanguage,
        validationErrorHandler
      ]
    }
    case 'getByIdMultilingual': {
      return [
        ...validateId,
        validationErrorHandler
      ]
    }
    case 'getProjects': {
      return [
        ...validateLanguage,
        ...validatePagination,
        ...validateSort,
        validationErrorHandler
      ]
    }
    case 'put': {
      return [
        ...validateId,
        validationErrorHandler,
        isExistById,
        ...validateBody,
        validationErrorHandler,
        validateLanguageFromDescription,
        validateName,
        validateImagesId,
        validateLinksImagesId
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
  body('name').trim().escape().notEmpty().isLength({ max: 100 }),
  body('type').optional().trim().isLength({ max: 30 }),
  body('events', 'Event is required').notEmpty(),
  body('spendTime').optional().trim().isLength({ max: 100 }),
  body('description').optional().customSanitizer(value => typeof value === 'string' ? { en: value } : value),
  body('description', 'Field description is not valid').optional().custom(value => {
    if (typeof value !== 'object') return false
    for (const key in value) {
      value[key] = escape(value[key])
    }
    return value
  }),
  ...validateEvents,
  body('links').optional().custom(value => Array.isArray(value) &&
    value.every((item: any) =>
      item.name &&
      item.link &&
      typeof item.name === 'string' &&
      typeof item.link === 'string')),
  body('stack').optional().custom((value) => Array.isArray(value) &&
    value.every((item: string) => item && typeof item === 'string' && item.length < 31)
  ),
  body('imagesId').optional().custom((value) => Array.isArray(value) &&
    value.every((item: string) => item && typeof item === 'string' && item.length < 11)
  )
]

const validateId = [
  param('projectId', 'Param projectId is wrong').isInt()
]

const validateSort = [
  query('sort', 'Param sort is wrong. Can use (+|-)type and (+|-)name')
    .optional()
    .custom(value => {
      const possibleFields = ['-type', '+type', '+name', '-name']
      if (typeof value === 'number') return false
      if (
        typeof value === 'string' &&
        !possibleFields.some(i => i === value)
      ) return false
      if (Array.isArray(value)) {
        if (!value.every(i => possibleFields.some(j => j === i))) return false

        /* check repeating field from sort list */
        const list = value.map(i => i.slice(1))
        return !repeatCheck(list)
      }
      return true
    })
]

async function validateName (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const projectId: string | number | undefined = req.params.projectId

    const namesFromDB = await projectModel.getNames()

    const _checkName = namesFromDB.some(
      item => item.name === req.body.name && item.id.toString() !== projectId?.toString())

    if (_checkName) {
      return next(createError(400, 'Project with such name is exist.', { source: 'name' }))
    }

    next()
  } catch (e) {
    next(createError(500, 'Error is during validate Name'))
  }
}

async function isExistById (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const projectId = parseInt(req.params.projectId)
    const _projectsFromDatabase = await projectModel.getNames()

    const _checking = _projectsFromDatabase.some(item => parseInt(item.id) === projectId)

    if (!_checking) {
      return next(createError(400, 'Project with such ID does not found', { source: 'projectId' }))
    }

    next()
  } catch (e) {
    next(createError(500, "Error is during searching project's id"))
  }
}

async function validateImagesId (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const imagesId = req.body.imagesId
    if (!imagesId) return next()

    if (!checkImageIdsInDB(imagesId)) {
      return next(createError(400, 'Some from list images id is wrong', { source: 'imagesId' }))
    }

    next()
  } catch (e) {
    next(createError(500, 'Error is during validate images ID'))
  }
}

async function validateLinksImagesId (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const imagesId = req.body.links?.map((i: LinkCreation) => i.imageId).filter((i: string | undefined) => i)
    if (!imagesId) return next()

    const checking = await checkImageIdsInDB(imagesId)
    if (!checking) {
      return next(createError(400, 'Some image Id from list links is wrong', { source: 'imagesId' }))
    }

    next()
  } catch (e) {
    next(createError(500, 'Error is during validate images ID'))
  }
}
