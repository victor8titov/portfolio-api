import express, { NextFunction } from 'express'
import { checkLanguageField } from '../../bin/common/check-languages'
import { sendJSON } from '../../bin/common/JSON-responses'
import { Language, TypeErrors } from '../../bin/database/types'
import { createHomePage, getHomePage, updateHomePage } from '../models/homepage'
import createError from 'http-errors'

export async function read (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const language = (req.query.language && typeof req.query.language === 'string' ? req.query.language : undefined) as Language | undefined

    if (language && !checkLanguageField(language)) {
      return next(createError(400, `Wrong language type. Can be ${Object.values(Language).join(', ')}.`, {
        source: 'Field of language in query string.',
        type: TypeErrors.INVALID_TYPE
      }))
    }

    const _data = await getHomePage({ language })

    sendJSON(res, 200, { items: !_data ? [] : _data })
  } catch (e) {
    next(createError(500, 'Error processing data for the home page.'))
  }
}

export async function create (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { language, title, description, subtitle } = req.body

    if (!language || !checkLanguageField(language)) {
      return next(createError(400, `Wrong language type. Can be ${Object.values(Language).join(', ')}`, {
        source: 'Field of language in query string.',
        type: TypeErrors.INVALID_TYPE
      }))
    }

    if (!title || !description) {
      return next(createError(400, 'Fill out the minimum fields such as Title and Description', {
        source: 'Field title or description.',
        type: TypeErrors.EMPTY_FILED
      }))
    }

    const _findRows = await getHomePage({ language })
    if (_findRows?.length) {
      return next(createError(400, 'You may need to update the data and not create', {
        source: 'Attempt created already exist homepage with field such language',
        type: TypeErrors.ALREADY_EXIST
      }))
    }

    const _dataAfterSave = await createHomePage({ language, title, description, subtitle })
    sendJSON(res, 200, { language: _dataAfterSave.language, message: 'The main page has created successfully.' })
  } catch (e) {
    next(createError(500, 'Error processing data for the home page.'))
  }
}

export async function update (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { language, title, description, subtitle } = req.body

    if (!language || !checkLanguageField(language)) {
      return next(createError(400, `Wrong language type. Can be ${Object.values(Language).join(', ')}`, {
        source: 'Field of language in query string.',
        type: TypeErrors.INVALID_TYPE
      }))
    }

    if (!title || !description) {
      return next(createError(400, 'Fill out the minimum fields such as Title and Description', {
        source: 'Field title or description.',
        type: TypeErrors.EMPTY_FILED
      }))
    }

    const _dataAfterUpdate = await updateHomePage({ language, title, description, subtitle })
    sendJSON(res, 200, { language: _dataAfterUpdate.language, message: 'The main page has updated successfully.' })
  } catch (e) {
    next(createError(500, 'Error processing data for the home page.'))
  }
}
