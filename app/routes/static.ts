import express, { Request, Response, NextFunction } from 'express'
import createError from 'http-errors'
import { handlerError } from '../middleware/handler-error'
import { getImage } from '../controllers/static'

const router = express.Router()

router.get('/images/*', getImage)

router.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404))
})

router.use(handlerError)

export { router as routersForStatic }
