import express, { NextFunction } from 'express'
import { Language } from '../../bin/database/types'
import { createHomePage, getHomePage, HomePage, updateHomePage } from '../models/homepage'
import createError from 'http-errors'
import { getAvatars, updateAvatar } from '../models/image'
import { getLanguages } from '../models/language'
import { Result, ValidationError, validationResult } from 'express-validator'

export async function read (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const errors: Result<ValidationError> = validationResult(req)
    if (!errors.isEmpty()) {
      return next(errors)
    }

    const language = (req.query.language as Language)

    let result: HomePage = {}

    const _homePage = await getHomePage({ language })
    if (!_homePage) return next(createError(400, 'Nothing found, Create a page'))
    const { title = '', subtitle = '', description = '' } = _homePage
    result = {
      title,
      subtitle,
      description,
      ...result
    }

    const _supportedLanguages = await getLanguages()
    const languages = _supportedLanguages
    result = { currentLanguage: language, languages, ...result }

    const avatars = await getAvatars()

    if (avatars.length) {
      result = { ...result, avatars }
    }

    res.status(200).json(result)
  } catch (e) {
    next(createError(500, 'Error processing data for the home page.'))
  }
}

export async function create (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const errors: Result<ValidationError> = validationResult(req)
    if (!errors.isEmpty()) {
      return next(errors)
    }

    const { title, description, subtitle, avatars } = req.body

    const _error = await createHomePage({ title, description, subtitle })

    if (_error instanceof Error) {
      return next(createError(400, _error.message))
    }

    await updateAvatar(avatars)

    res.status(200).json({ message: 'The main page has created successfully.' })
  } catch (e) {
    next(createError(500, 'Error processing data for the home page.'))
  }
}

export async function update (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const errors: Result<ValidationError> = validationResult(req)
    if (!errors.isEmpty()) {
      return next(errors)
    }

    const { title, description, subtitle, avatars = [] } = req.body

    await updateHomePage({ title, description, subtitle, avatars })
    await updateAvatar(avatars)
    res.status(200).json({ message: 'The main page has updated successfully.' })
  } catch (e) {
    next(createError(500, 'Error processing data for the home page.'))
  }
}
