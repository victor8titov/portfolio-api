import express, { NextFunction } from 'express'
import createError from 'http-errors'
import { getLanguages } from '../models/language'
import * as model from '../models/time-stamps'
import { Language } from '../models/types'

export async function getAll (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const currentLanguage = req.query.language

    const languages = await getLanguages()

    const _checkingLanguage = languages.some(_lang => currentLanguage === _lang)
    if (!_checkingLanguage) {
      const _message = `The language is incorrect, possible ${languages.join(', ')}`
      return next(createError(400, _message, { source: 'language' }))
    }

    const items = await model.getListTimeStamps(currentLanguage as Language)

    res.status(200).json({ currentLanguage, languages, items } as model.ListTimeStamps)
  } catch (e) {
    next(createError(500, 'Error during getting list time stamps'))
  }
}

export async function getById (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const timeStampId = req.params.timeStampId
    const currentLanguage = req.query.language

    const _timeStamp = await model.getTimeStampById(timeStampId, currentLanguage as Language)

    if (!_timeStamp) {
      next(createError(400, 'Such time stamp is not exist'))
    }
    res.status(200).json({ ..._timeStamp, currentLanguage } as model.TimeStampView)
  } catch (e) {
    next(createError(500, 'Error'))
  }
}

export async function create (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { name, link, events, description } = req.body
    const timeStamp = { name, link, events, description }

    const id = await model.createTimeStamp(timeStamp)

    res.status(200).json({ id, message: 'Time stamp is created successfully' })
  } catch (e) {
    next(createError(500, 'Error is during creating time stamp'))
  }
}

export async function update (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const timeStampId = req.params.timeStampId
    const { name, link, events, description } = req.body
    const timeStamp = { name, link, events, description }

    await model.updateTimeStamp(timeStampId, timeStamp)

    res.status(200).json({ id: timeStampId, message: 'Time stamp is updated successfully' })
  } catch (e) {
    next(createError(500, 'Error during updating time stamp'))
  }
}

export async function deleteById (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const timeStampId = req.params.timeStampId
    await model.deleteTimeStampById(timeStampId)

    res.status(200).json({ id: timeStampId, message: 'Time stamp is deleted successfully' })
  } catch (e) {
    next(createError(500, 'Error during deleting time stamp entity'))
  }
}
