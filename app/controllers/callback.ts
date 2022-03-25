import express, { NextFunction } from 'express'
import createError from 'http-errors'

export async function callback (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { email, message } = req.body

    res.status(200).json({ message: 'Your message is received and nearest time I answer you', testData: { email, message } })
  } catch (e) {
    next(createError(500, 'Error is during getting skills'))
  }
}
