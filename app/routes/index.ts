import express, { Request, Response, NextFunction } from 'express'
import * as homepage from '../controllers/homepage'
import * as authController from '../controllers/auth'
import { auth } from '../middleware/auth'
import createError, { HttpError } from 'http-errors'
import { sendJSON } from '../../bin/common/JSON-responses'

const router = express.Router()

router.get('/auth/login', authController.login)
router.get('/auth/logout', authController.logout)
router.post('/auth/refresh-token', authController.refreshToken)

router.get('/homepage', homepage.read)
router.post('/homepage', auth, homepage.create)
router.put('/homepage', auth, homepage.update)

// catch 404 and forward to error handler
router.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404))
})

router.use(handlerError)

function handlerError (err: HttpError, req: Request, res: Response, next: NextFunction) {
  sendJSON(res, err.status || 500, {
    ...(err.source ? { source: err.source } : {}),
    ...(err.type ? { type: err.type } : {}),
    message: err.message || 'Internal Server Error'
  })
}

export { router as apiRouters }
