import { NextFunction, Request, Response } from 'express'
import { Image, TemplateImage, TypeErrors } from '../../bin/database/types'
import createError from 'http-errors'
import { pathForImages } from '../config/base'
import sharp from 'sharp'
import { createImages, getTemplatesImage } from '../models/image'
import { generateId } from '../../bin/common/generate-id'

// TODO разрулить вопрос с типизацией тяниться с предыдушего middleware
export async function uploadImage (req: any, res: Response, next: NextFunction) {
  try {
    const _file: Express.Multer.File | undefined = req.file
    if (!_file) return next(createError(400, 'Incorrect request', { type: TypeErrors.EMPTY_FILED, source: 'Field file' }))

    const _images: Image[] = []

    const _templates: (Omit<TemplateImage, 'width'> & {width: number | null})[] = await getTemplatesImage()
    _templates.push({ id: '', name: 'original size', suffix: 'original', width: null, height: null })

    const _id = generateId(10)

    for (const template of _templates) {
      const { width, height, suffix } = template

      const _name = `${req.name}-${_id}${width ? '-' + width : ''}${height ? 'x' + height : ''}-${suffix}.webp`

      sharp(_file.buffer)
        .resize(template.width ? template.width : null, template.height)
        .webp()
        .toFile(`${pathForImages}/${_name}`)
      _images.push({ id: _id, name: _name, description: req.description ? req.description : null, width, height })
    }

    await createImages(_images)
    return res.status(200).json({
      id: _id,
      items: _images.map((item) => {
        return {
          url: `/public/images/${item.name}`,
          description: item.description
        }
      })
    })
  } catch (e: any) {
    next(createError(500, e.message || 'Error processing data'))
  }
}
