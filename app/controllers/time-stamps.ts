import express, { NextFunction } from 'express'
import createError from 'http-errors'
import { ListTimeStamps, timeStampModel, TimeStampView, TimeStampViewMultilingual } from '../models/time-stamps'
import { Language } from '../models/types'

export async function getAll (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const currentLanguage = req.query.language

    const body = await timeStampModel.getAll(currentLanguage as Language)

    res.status(200).json(body as ListTimeStamps)
  } catch (e) {
    next(createError(500, 'Error during getting list time stamps'))
  }
}

export async function getById (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const timeStampId = req.params.timeStampId
    const currentLanguage = req.query.language

    const _timeStamp = await timeStampModel.getById(timeStampId, currentLanguage as Language)

    if (!_timeStamp) {
      next(createError(400, 'Such time stamp is not exist'))
    }
    res.status(200).json(_timeStamp as TimeStampView)
  } catch (e) {
    next(createError(500, 'Error'))
  }
}

export async function getByIdMultilingual (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const timeStampId = req.params.timeStampId

    const _timeStamp = await timeStampModel.getByIdMultilingual(timeStampId)

    if (!_timeStamp) {
      next(createError(400, 'Such time stamp is not exist'))
    }
    res.status(200).json(_timeStamp as TimeStampViewMultilingual)
  } catch (e) {
    next(createError(500, 'Error'))
  }
}

export async function create (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { name, link = '', events, description } = req.body
    const timeStamp = { name, link, events, description }

    const id = await timeStampModel.create(timeStamp)

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

    await timeStampModel.update(timeStampId, timeStamp)

    res.status(200).json({ id: timeStampId, message: 'Time stamp is updated successfully' })
  } catch (e) {
    next(createError(500, 'Error during updating time stamp'))
  }
}

export async function deleteById (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const timeStampId = req.params.timeStampId
    await timeStampModel.delete(timeStampId)

    res.status(200).json({ id: timeStampId, message: 'Time stamp is deleted successfully' })
  } catch (e) {
    next(createError(500, 'Error during deleting time stamp entity'))
  }
}
