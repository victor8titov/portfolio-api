import { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import sharp from 'sharp'
import { createImages, getTemplatesImage, Image, TemplateImage } from '../models/image'
import { generateId } from '../../bin/common/generate-id'
import { pathForImages } from '../../bin/common/paths'
import { TypeErrors } from '../models/types'

// TODO разрулить вопрос с типизацией тяниться с предыдушего middleware
export async function uploadImage (req: any, res: Response, next: NextFunction) {
  try {
    const _file: Express.Multer.File | undefined = req.file
    if (!_file) return next(createError(400, 'Incorrect request', { type: TypeErrors.EMPTY_FILED, source: 'Field file' }))

    const _images: Omit<Image, 'url'>[] = []

    const _templates: (Omit<TemplateImage, 'width'> & {width: number | null})[] = await getTemplatesImage()

    const _id = generateId(10)

    for (const template of _templates) {
      const { width, height, name: templateName } = template

      const _name = `${req.name}-${_id}${width ? '-' + width : ''}${height ? 'x' + height : ''}-${templateName}.webp`

      sharp(_file.buffer)
        .resize(template.width ? template.width : null, template.height)
        .webp()
        .toFile(`${pathForImages}/${_name}`)

      _images.push(
        {
          id: _id,
          name: _name,
          description: req.description || '',
          width,
          height,
          templateName
        })
    }

    await createImages(_images)
    return res.status(200).json({
      id: _id,
      items: _images.map((item) => {
        return {
          url: `/public/images/${item.name}`,
          name: item.name,
          description: item.description,
          width: item.width,
          height: item.height,
          templateName: item.templateName
        }
      })
    })
  } catch (e: any) {
    next(createError(500, e.message || 'Error processing data'))
  }
}
