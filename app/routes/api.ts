import express, { Request, Response, NextFunction } from 'express'
import * as homepage from '../controllers/homepage'
import * as authController from '../controllers/auth'
import * as uploadControllers from '../controllers/upload'
import * as imageControllers from '../controllers/image'
import * as projectControllers from '../controllers/project'
import * as skillsControllers from '../controllers/skills'
import * as timeStampControllers from '../controllers/time-stamps'
import * as callbackControllers from '../controllers/callback'
import * as socialMediaControllers from '../controllers/social-media'
import { validate as validateProjects } from '../../bin/middleware/projects'
import { validate as validateHomepage } from '../../bin/middleware/homepage'
import { auth, validate as validateAuth } from '../../bin/middleware/auth'
import { validateImage } from '../../bin/middleware/image'
import { validate as validateSkills } from '../../bin/middleware/skills'
import { validate as validateTimeStamps } from '../../bin/middleware/time-stamps'
import { validate as validationSocialMedia } from '../../bin/middleware/social-media'
import createError from 'http-errors'
import { uploadImage, validateUpload } from '../../bin/middleware/upload'
import { errorHandler } from '../../bin/middleware/handler-error'
import { validateCallback } from '../../bin/middleware/callback'

const router = express.Router()

/* goal Authentication */
router.get('/auth/login', validateAuth('login'), authController.login)
router.get('/auth/logout', validateAuth('logout'), authController.logout)
router.post('/auth/refresh-token', validateAuth('refreshToken'), authController.refreshToken)

/* goal Homepage */
router.get('/homepage', validateHomepage('read'), homepage.read)
router.post('/homepage', auth, validateHomepage('create'), homepage.create)
router.put('/homepage', auth, validateHomepage('update'), homepage.update)

/* goal Project */
router.get('/projects', validateProjects('getProjects'), projectControllers.getProjects)
router.post('/projects', auth, validateProjects('create'), projectControllers.create)
router.get('/project/:projectId', validateProjects('getById'), projectControllers.getProject)
router.put('/project/:projectId', auth, validateProjects('put'), projectControllers.update)
router.delete('/project/:projectId', auth, validateProjects('delete'), projectControllers.deleteProject)

/* goal Skills */
router.get('/skills', validateSkills('getSkills'), skillsControllers.getSkills)
router.post('/skills', auth, validateSkills('create'), skillsControllers.create)
router.get('/skill/:skillId', validateSkills('getById'), skillsControllers.getSkill)
router.put('/skill/:skillId', auth, validateSkills('update'), skillsControllers.update)
router.delete('/skill/:skillId', auth, validateSkills('delete'), skillsControllers.deleteSkill)

/* goal Time Stamps */
router.get('/time-stamps', validateTimeStamps('getAll'), timeStampControllers.getAll)
router.post('/time-stamps', auth, validateTimeStamps('create'), timeStampControllers.create)
router.get('/time-stamp/:timeStampId', validateTimeStamps('getById'), timeStampControllers.getById)
router.put('/time-stamp/:timeStampId', auth, validateTimeStamps('update'), timeStampControllers.update)
router.delete('/time-stamp/:timeStampId', auth, validateTimeStamps('deleteById'), timeStampControllers.deleteById)

/* goal callback */
router.post('/callback', validateCallback, callbackControllers.callback)

/* goal social-media */
router.get('/social-media', socialMediaControllers.getAll)
router.post('/social-media', validationSocialMedia('create'), socialMediaControllers.create)
router.put('/social-media/:socialMediaId', validationSocialMedia('update'), socialMediaControllers.update)
router.delete('/social-media/:socialMediaId', validationSocialMedia('delete'), socialMediaControllers.deleteById)

router.post('/upload/image', auth, validateUpload, uploadImage, uploadControllers.uploadImage)

router.get('/image/:fileId', auth, validateImage, imageControllers.getById)
router.delete('/image/:fileId', auth, validateImage, imageControllers.deleteById)

router.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404))
})

router.use(errorHandler)

export { router as routersForApi }
