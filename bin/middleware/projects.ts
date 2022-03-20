import express, { NextFunction, RequestHandler } from 'express'
import escape from 'validator/lib/escape'
import { body, ValidationChain, query, validationResult, ValidationError, Result, sanitize, param } from 'express-validator'
import { checkLanguageField } from '../../bin/common/check-languages'
import { Language, TypeErrors } from '../../bin/database/types'
import createError from 'http-errors'
import path from 'path'
import { urlForStaticImages } from '../../bin/common/paths'
import { generateId } from '../../bin/common/generate-id'
import { getLanguages } from '../../app/models/language'
import { getNameProjects } from '../../app/models/project'
import { getListImagesId } from '../../app/models/image'
import { validateLanguage, validatePagination } from './validate-common'

export function validate (method: string): (ValidationChain | RequestHandler)[] {
  switch (method) {
    case 'create': {
      return [
        ...validateBody,
        validateLanguageFromDescription,
        validateName,
        validateImagesId
      ]
    }
    case 'getById': {
      return [
        ...validateId,
        ...validateLanguage
      ]
    }
    case 'getProjects': {
      return [
        ...validateLanguage,
        ...validatePagination,
        ...validateSort
      ]
    }
    case 'put': {
      return [
        ...validateId,
        isExistById,
        ...validateBody,
        validateLanguageFromDescription,
        validateName,
        validateImagesId
      ]
    }
    case 'delete': {
      return [
        ...validateId,
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
  body('type').optional().trim().isLength({ max: 30 }),
  body('spendTime').optional().trim().isLength({ max: 100 }),
  body('description', 'Field description is not valid').optional().custom(value => {
    if (typeof value !== 'object') return false
    for (const key in value) {
      value[key] = escape(value[key])
    }
    return value
  }),
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
        let repeatField = false
        value.reduce((total, current) => {
          if (repeatField) return total

          const _field = current.slice(1)
          if (total.some((i: string) => i === _field)) repeatField = true
          total.push(_field)
          return total
        }, [])
        if (repeatField) return false
      }
      return true
    })
]

async function validateLanguageFromDescription (req: express.Request, res: express.Response, next: NextFunction) {
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

async function validateName (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const projectId: string | number = req.params.projectId ?? -1
    const _namesOfExistProjects = await getNameProjects()

    const _checkName = _namesOfExistProjects.some(
      item => item.name === req.body.name && parseInt(item.id) !== parseInt(projectId))

    if (_checkName) {
      return next(createError(400, 'Project with such name is exist.', { source: 'name' }))
    }

    next()
  } catch (e) {
    next(createError(500, 'Error is during validate Name'))
  }
}

async function validateImagesId (req: express.Request, res: express.Response, next: NextFunction) {
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

async function isExistById (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const projectId = parseInt(req.params.projectId)
    const _projectsFromDatabase = await getNameProjects()

    const _checking = _projectsFromDatabase.some(item => parseInt(item.id) === projectId)

    if (!_checking) {
      return next(createError(400, 'Project with such ID does not found', { source: 'projectId' }))
    }

    next()
  } catch (e) {
    next(createError(500, "Error is during searching project's id"))
  }
}
