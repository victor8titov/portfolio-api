import express, { Request, Response, NextFunction } from 'express'
import * as homepage from '../controllers/homepage'
import * as authController from '../controllers/auth'
import * as uploadControllers from '../controllers/upload'
import * as imageControllers from '../controllers/image'
import { auth } from '../middleware/auth'
import createError from 'http-errors'
import { uploadImage } from '../middleware/upload'
import { handlerError } from '../middleware/handler-error'

const router = express.Router()

router.get('/auth/login', authController.login)
router.get('/auth/logout', authController.logout)
router.post('/auth/refresh-token', authController.refreshToken)

router.get('/homepage', homepage.read)
router.post('/homepage', auth, homepage.create)
router.put('/homepage', auth, homepage.update)

router.post('/upload/image', auth, uploadImage, uploadControllers.uploadImage)

router.get('/image/:fileId', auth, imageControllers.getImage)
router.delete('/image/:fileId', auth, imageControllers.deleteImage)

router.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404))
})

router.use(handlerError)

export { router as routersForApi }
