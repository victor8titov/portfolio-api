import { RequestHandler } from 'express'
import { body, ValidationChain } from 'express-validator'
import { validationErrorHandler } from './handler-error'

const validateBody = [
  body('email', 'Email is required').trim().notEmpty().bail()
    .escape().isLength({ max: 100 }).isEmail()
    .withMessage('Incorrect Email'),
  body('message', 'Message is required').trim().notEmpty().bail()
    .escape(),
  validationErrorHandler
]

export const validateCallback: (ValidationChain | RequestHandler)[] = [
  ...validateBody
]
