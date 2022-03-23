import express, { Request, Response, NextFunction } from 'express'
import * as homepage from '../controllers/homepage'
import * as authController from '../controllers/auth'
import * as uploadControllers from '../controllers/upload'
import * as imageControllers from '../controllers/image'
import * as projectControllers from '../controllers/project'
import { validate as validateProjects } from '../../bin/middleware/projects'
import { validate as validateHomepage } from '../../bin/middleware/homepage'
import { auth, validate as validateAuth } from '../../bin/middleware/auth'
import { validate as validateImage } from '../../bin/middleware/image'
import createError from 'http-errors'
import { uploadImage } from '../../bin/middleware/upload'
import { errorHandler } from '../../bin/middleware/handler-error'

const router = express.Router()

router.get('/auth/login', validateAuth('login'), authController.login)
router.get('/auth/logout', validateAuth('logout'), authController.logout)
router.post('/auth/refresh-token', validateAuth('refreshToken'), authController.refreshToken)

router.get('/homepage', validateHomepage('read'), homepage.read)
router.post('/homepage', auth, validateHomepage('create'), homepage.create)
router.put('/homepage', auth, validateHomepage('update'), homepage.update)

/* goal Project */
router.get('/projects', validateProjects('getProjects'), projectControllers.getProjects)
router.post('/projects', auth, validateProjects('create'), projectControllers.create)
router.get('/project/:projectId', validateProjects('getById'), projectControllers.getProject)
router.put('/project/:projectId', auth, validateProjects('put'), projectControllers.update)
router.delete('/project/:projectId', auth, validateProjects('delete'), projectControllers.deleteProject)

router.post('/upload/image', auth, uploadImage, uploadControllers.uploadImage)

router.get('/image/:fileId', auth, validateImage, imageControllers.getImage)
router.delete('/image/:fileId', auth, validateImage, imageControllers.deleteImage)

router.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404))
})

router.use(errorHandler)

export { router as routersForApi }
