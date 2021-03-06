import 'dotenv/config'
import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import { routersForApi } from './routes/api'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import passport from 'passport'
import './bin/config/passport-jwt-strategy'
import { routersForStatic } from './routes/static'
import { errorHandler } from './bin/middleware/handler-error'
import cors from 'cors'

const swaggerDocument = YAML.load(path.resolve(__dirname, './bin/openapi/bundle-doc.yaml'))

const app = express()

// const corsOptions = {
//   origin: process.env.ORIGIN
// }

app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(passport.initialize())

app.use('/api', routersForApi)
app.use('/public', routersForStatic)

app.use(
  '/api-documentation',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
)

app.use(function (req, res, next) {
  next(createError(404))
})

app.use(errorHandler)

export default app
