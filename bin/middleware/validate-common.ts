import { query } from 'express-validator'
import { Language } from '../../bin/database/types'

export const validateLanguage = [
  query('language', 'Query language is wrong, it can be string and length 5')
    .default(Language.EN)
    .isString()
    .isLength({ max: 5 }),
  query('language', `The language is incorrect, possible ${Object.values(Language).join(', ')}.`)
    .custom(value => Object.values(Language).some(i => i.toLowerCase() === value.toLowerCase()))
]

export const validatePagination = [
  query('page').optional(),
  query('pageSize').optional()
]
