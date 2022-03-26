import express, { NextFunction } from 'express'
import * as model from '../models/homepage'
import createError from 'http-errors'
import { getLanguages } from '../models/language'
import { Language } from '../models/types'

export async function read (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const language = (req.query.language as Language)

    let result: model.HomePage = {}

    const _homePage = await model.getHomePage({ language })
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

    const avatars = await model.getAvatars()

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
    const { title, description, subtitle, avatars } = req.body

    const _error = await model.createHomePage({ title, description, subtitle })

    if (_error instanceof Error) {
      return next(createError(400, _error.message))
    }

    await model.updateAvatar(avatars)

    res.status(200).json({ message: 'The main page has created successfully.' })
  } catch (e) {
    next(createError(500, 'Error processing data for the home page.'))
  }
}

export async function update (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { title, description, subtitle, avatars = [] } = req.body

    await model.updateHomePage({ title, description, subtitle, avatars })
    await model.updateAvatar(avatars)

    res.status(200).json({ message: 'The main page has updated successfully.' })
  } catch (e) {
    next(createError(500, 'Error processing data for the home page.'))
  }
}
