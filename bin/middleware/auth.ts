import express, { NextFunction, Request, Response, RequestHandler } from 'express'
import passport from 'passport'
import { TypeErrors, User } from '../database/types'
import createError from 'http-errors'
import { body, ValidationChain, query, param, Result, ValidationError, validationResult } from 'express-validator'
import { getUserByName } from '../../app/models/user'
import { validationErrorHandler } from './handler-error'

export function auth (req: Request, res: Response, next: NextFunction) {
  passport.authenticate('jwt', function (err: any, user: User, info: Error) {
    if (err) { return next(err) }

    if (info && info.message) {
      console.log(info.message)
      return next(createError(401, info.message, { type: TypeErrors.AUTHENTICATION, source: 'auth function' }))
    }

    if (!user) {
      return next(createError(403))
    }

    req.user = user
    next()
  })(req, res, next)
}

export function validate (method: string): (ValidationChain | RequestHandler)[] {
  switch (method) {
    case 'login': {
      return [
        query('username', 'Username and Password are required field').notEmpty(),
        query('password', 'Username and Password are required field').notEmpty(),
        query('username', 'Not correct field length').trim().isLength({ max: 20, min: 5 }),
        query('password', 'Not correct field length').trim().isLength({ max: 20, min: 5 }),
        query('username', 'Username and Password have to be string').isString().escape(),
        query('password', 'Username and Password have to be string').isString().escape(),
        validationErrorHandler

      ]
    }
    case 'logout': {
      return [
        query('username', 'Username is required field').notEmpty(),
        query('username', 'Not correct field length').trim().isLength({ max: 20, min: 5 }),
        query('username', 'Username have to be string').isString(),
        validationErrorHandler,
        validateUser
      ]
    }
    case 'refreshToken': {
      return [
        
      ]
    }
    default: {
      return []
    }
  }
}

async function validateUser (req: express.Request, res: express.Response, next: NextFunction) {
  const username = req.query.username as string
  if (!username) return next()

  const _user = await getUserByName(username)
  if (!_user) {
    return next(createError(400, 'Name is no valid'))
  }

  next()
}
