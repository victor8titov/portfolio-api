import express, { NextFunction } from 'express'
import createError from 'http-errors'
import { homePageModel, HomePageMultilingual, HomePageView } from '../models/homepage'
import { Language } from '../models/types'

export async function readMultilingual (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const _homePage = await homePageModel.getWitAllLanguages()
    if (!_homePage) return next(createError(400, 'Nothing found, Create a page'))

    res.status(200).json(_homePage as HomePageMultilingual)
  } catch (e) {
    next(createError(500, 'Error processing data for the home page.'))
  }
}

export async function read (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const language = (req.query.language as Language)

    const _homePage = await homePageModel.get({ language })
    if (!_homePage) return next(createError(400, 'Nothing found, Create a page'))

    res.status(200).json(_homePage as HomePageView)
  } catch (e) {
    next(createError(500, 'Error processing data for the home page.'))
  }
}

export async function create (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { title, description, subtitle, avatars } = req.body

    const error = await homePageModel.create({ title, description, subtitle, avatars })

    if (error instanceof Error) {
      return next(createError(400, error.message))
    }

    res.status(200).json({ message: 'The main page has created successfully.' })
  } catch (e) {
    next(createError(500, 'Error processing data for the home page.'))
  }
}

export async function update (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { title, description, subtitle, avatars } = req.body

    await homePageModel.update({ title, description, subtitle, avatars })

    res.status(200).json({ message: 'The main page has updated successfully.' })
  } catch (e) {
    next(createError(500, 'Error processing data for the home page.'))
  }
}
