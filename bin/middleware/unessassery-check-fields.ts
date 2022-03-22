import { Request, Response, NextFunction } from 'express'
import createError, { HttpError } from 'http-errors'
import { Language, TypeErrors } from '../../app/models/types'
import { checkLanguageField } from '../common/unessasery-check-languages'

export function checkLanguage (req: Request, res: Response, next: NextFunction): void {
  const { language } = req.body

  if (!language || !checkLanguageField(language)) {
    return next(createError(400, `Wrong language type. Can be ${Object.values(Language).join(', ')}`, {
      source: 'Field of language in query string.',
      type: TypeErrors.INVALID_TYPE
    }))
  }

  next()
}
