import express, { Request, Response, NextFunction } from 'express'
import * as homepage from '../controllers/homepage'
import * as authController from '../controllers/auth'
import * as uploadControllers from '../controllers/upload'
import * as imageControllers from '../controllers/image'
import * as projectControllers from '../controllers/project'
import * as middlewareProject from '../../bin/middleware/projects'
import { auth } from '../../bin/middleware/auth'
import createError from 'http-errors'
import { uploadImage } from '../../bin/middleware/upload'
import { handlerError } from '../../bin/middleware/handler-error'

const router = express.Router()

router.get('/auth/login', authController.login)
router.get('/auth/logout', authController.logout)
router.post('/auth/refresh-token', authController.refreshToken)

router.get('/homepage', homepage.read)
router.post('/homepage', auth, homepage.create)
router.put('/homepage', auth, homepage.update)

/* goal Project */
router.get('/projects',
  middlewareProject.validate('getProjects'),
  projectControllers.getProjects
)
router.post('/projects',
  middlewareProject.validate('create'),
  projectControllers.create
)
router.get('/project/:projectId',
  middlewareProject.validate('getById'),
  projectControllers.getProject
)
router.put('/project/:projectId',
  middlewareProject.validate('put'),
  projectControllers.update
)
router.delete('/project/:projectId',
  middlewareProject.validate('delete'),
  projectControllers.deleteProject)

router.post('/upload/image', auth, uploadImage, uploadControllers.uploadImage)

router.get('/image/:fileId', auth, imageControllers.getImage)
router.delete('/image/:fileId', auth, imageControllers.deleteImage)

router.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404))
})

router.use(handlerError)

export { router as routersForApi }
