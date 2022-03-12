import express, { NextFunction } from 'express'
import { checkLanguageField } from '../../bin/common/check-languages'
import { HomePage, Language, TypeErrors } from '../../bin/database/types'
import { createHomePage, getHomePage, updateHomePage } from '../models/homepage'
import createError from 'http-errors'
import { getImages } from '../models/image'
import path from 'path'
import { urlForStaticImages } from '../../bin/common/paths'

export async function read (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const language = (req.query.language && typeof req.query.language === 'string' ? req.query.language : undefined) as Language | undefined

    if (language && !checkLanguageField(language)) {
      return next(createError(400, `Wrong language type. Can be ${Object.values(Language).join(', ')}.`, {
        source: 'Field of language in query string.',
        type: TypeErrors.INVALID_TYPE
      }))
    }

    const _homepageRows = (await getHomePage({ language })) || []

    const _data: Omit<HomePage, 'imageId' | 'image'>[] = []

    for (const row of _homepageRows) {
      const _images: any | undefined = undefined

      if (row.image) {
        const _imagesRows = await getImages(row.image)
        if (_imagesRows.length) {
          _images.id = row.image
          _images.items = []

          _imagesRows.forEach(item => {
            _images.items.push({
              name: item.name,
              description: item.description,
              width: item.width,
              height: item.height,
              templateName: item.templateName,
              url: path.resolve(urlForStaticImages, item.name)
            })
          })
        }
      }

      _data.push({
        language: row.language,
        title: row.title,
        subtitle: row.subtitle,
        description: row.description,
        images: _images || null
      })
    }

    res.status(200).json({ items: _data })
  } catch (e) {
    next(createError(500, 'Error processing data for the home page.'))
  }
}

export async function create (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { language, title, description, subtitle, imageId } = req.body

    if (!language || !checkLanguageField(language)) {
      return next(createError(400, `Wrong language type. Can be ${Object.values(Language).join(', ')}`, {
        source: 'Field of language in query string.',
        type: TypeErrors.INVALID_TYPE
      }))
    }

    if (!title || !description) {
      return next(createError(400, 'Fill out the minimum fields such as Title and Description', {
        source: 'Field title or description.',
        type: TypeErrors.EMPTY_FILED
      }))
    }

    const _findRows = await getHomePage({ language })
    if (_findRows?.length) {
      return next(createError(400, 'You may need to update the data and not create', {
        source: 'Attempt created already exist homepage with field such language',
        type: TypeErrors.ALREADY_EXIST
      }))
    }

    if (imageId) {
      const _images = await getImages(imageId)

      if (!_images.length) {
        return next(createError(400, 'There is no image with such an ID', {
          source: 'imageId',
          type: TypeErrors.NO_EXIST
        }))
      }
    }

    await createHomePage({ language, title, description, subtitle, imageId })

    res.status(200).json({ language, message: 'The main page has created successfully.' })
  } catch (e) {
    next(createError(500, 'Error processing data for the home page.'))
  }
}

export async function update (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { language, title, description, subtitle, imageId } = req.body

    if (!language || !checkLanguageField(language)) {
      return next(createError(400, `Wrong language type. Can be ${Object.values(Language).join(', ')}`, {
        source: 'Field of language in query string.',
        type: TypeErrors.INVALID_TYPE
      }))
    }

    if (!title || !description) {
      return next(createError(400, 'Fill out the minimum fields such as Title and Description', {
        source: 'Field title or description.',
        type: TypeErrors.EMPTY_FILED
      }))
    }

    if (imageId) {
      const _images = await getImages(imageId)

      if (!_images.length) {
        return next(createError(400, 'There is no image with such an ID', {
          source: 'imageId',
          type: TypeErrors.NO_EXIST
        }))
      }
    }

    await updateHomePage({ language, title, description, subtitle, imageId })
    res.status(200).json({ language, message: 'The main page has updated successfully.' })
  } catch (e) {
    next(createError(500, 'Error processing data for the home page.'))
  }
}
