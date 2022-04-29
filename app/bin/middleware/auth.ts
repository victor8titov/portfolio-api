import express, { NextFunction, Request, Response, RequestHandler } from 'express'
import passport from 'passport'
import createError from 'http-errors'
import { body, ValidationChain, query } from 'express-validator'
import { getUserByName, User } from '../../models/user'
import { validationErrorHandler } from './handler-error'
import { TypeErrors } from '../../models/types'
import jwt from 'jsonwebtoken'

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

export function validate (method: 'login' | 'logout' | 'refreshToken'): (ValidationChain | RequestHandler)[] {
  switch (method) {
    case 'login': {
      return [
        body('username', 'Username and Password are required field').notEmpty(),
        body('password', 'Username and Password are required field').notEmpty(),
        body('username', 'Not correct field length').trim().isLength({ max: 20, min: 5 }),
        body('password', 'Not correct field length').trim().isLength({ max: 20, min: 5 }),
        body('username', 'Username and Password have to be string').isString().escape(),
        body('password', 'Username and Password have to be string').isString().escape(),
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
        body('refreshToken', 'Refresh Token is required!').notEmpty(),
        body('refreshToken', 'Field is not JWT token').isJWT(),
        validationErrorHandler,
        validateToken
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

function validateToken (req: express.Request, res: express.Response, next: NextFunction) {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    return next(createError(500, 'No data for checking refresh token'))
  }

  const { refreshToken } = req.body

  jwt.verify(refreshToken, secret, function (err: any, decoded: any) {
    if (err) return next(createError(422, err.message))

    if (decoded) next()
    else next(createError(400))
  })
}
