import { NextFunction, Request, Response } from 'express'
import passport from 'passport'
import { TypeErrors, User } from '../../bin/database/types'
import createError from 'http-errors'

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
