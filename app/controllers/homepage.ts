import express from 'express'
import { checkLanguageField } from '../../bin/common/check-languages'
import { sendJSON } from '../../bin/common/JSON-responses'
import { HomePage, Language, TypeErrors } from '../../bin/database/types'
import { createHomePage, getHomePage, updateHomePage } from '../models/homepage'

export async function read (req: express.Request, res: express.Response) {
  try {
    if (typeof req.query.language === 'string' && req.query.language.length && !checkLanguageField(req.query.language)) {
      sendJSON(res, 400, {
        source: 'Field of language in query string.',
        type: TypeErrors.INVALID_TYPE,
        message: `Wrong language type. Can be ${Object.values(Language).join(', ')}.`
      })
      return
    }

    const language = (checkLanguageField(req.query.language) ? req.query.language : undefined) as Language | undefined

    const _data = await getHomePage({ language })

    sendJSON(res, 200, { items: !_data ? [] : _data })
  } catch (e) {
    sendJSON(res, 500, { message: 'Error processing data for the home page.' })
  }
}

export async function create (req: express.Request, res: express.Response) {
  try {
    const { language, title, description, subtitle } = req.body

    if (!language || !checkLanguageField(language)) {
      sendJSON(res, 400, {
        source: 'Field of language in query string.',
        type: TypeErrors.INVALID_TYPE,
        message: `Wrong language type. Can be ${Object.values(Language).join(', ')}`
      })
      return
    }

    if (!title || !description) {
      sendJSON(res, 400, {
        source: 'Field title or description.',
        type: TypeErrors.EMPTY_FILED,
        message: 'Fill out the minimum fields such as Title and Description'
      })
      return
    }

    const _findRows = await getHomePage({ language })
    if (_findRows?.length) {
      sendJSON(res, 400, {
        source: 'Attempt created already exist homepage with field such language',
        type: TypeErrors.ALREADY_EXIST,
        message: 'You may need to update the data and not create'
      })
      return
    }

    const _dataAfterSave = await createHomePage({ language, title, description, subtitle })
    sendJSON(res, 200, { language: _dataAfterSave.language, message: 'The main page has created successfully.' })
  } catch (e) {
    sendJSON(res, 500, { message: 'Error processing data for the home page.' })
  }
}

export async function update (req: express.Request, res: express.Response) {
  try {
    const { language, title, description, subtitle } = req.body

    if (!language || !checkLanguageField(language)) {
      sendJSON(res, 400, {
        source: 'Field of language in query string.',
        type: TypeErrors.INVALID_TYPE,
        message: `Wrong language type. Can be ${Object.values(Language).join(', ')}`
      })
      return
    }

    if (!title || !description) {
      sendJSON(res, 400, {
        source: 'Field title or description.',
        type: TypeErrors.EMPTY_FILED,
        message: 'Fill out the minimum fields such as Title and Description'
      })
      return
    }

    const _dataAfterUpdate = await updateHomePage({ language, title, description, subtitle })
    sendJSON(res, 200, { language: _dataAfterUpdate.language, message: 'The main page has updated successfully.' })
  } catch (e) {
    sendJSON(res, 500, { message: 'Error processing data for the home page.' })
  }
}
