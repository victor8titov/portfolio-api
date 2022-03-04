import express from 'express'
import * as homepage from '../controllers/homepage'

const router = express.Router()

router.get('/homepage', homepage.read)
router.post('/homepage', homepage.create)
router.put('/homepage', homepage.update)

export { router as apiRouters }
