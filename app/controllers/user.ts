import express, { NextFunction } from 'express'
import createError from 'http-errors'
import { User } from '../models/user'

export async function getUser (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { email, name, id } = req.user as User

    res.status(200).json({ name, email, id })
  } catch (e) {
    next(createError(500, 'Error is during getting skills'))
  }
}
