import { NextFunction, Response } from 'express'
import createError from 'http-errors'
import sharp from 'sharp'
import { ImageByTemplateCreation, TemplateImage, imageModel } from '../models/image'
import { generateBaseImageName, pathForImages } from '../bin/common/paths'

// TODO repair types req: any.
export async function uploadImage (req: any, res: Response, next: NextFunction) {
  try {
    const { name, description, file } = req.body

    const _aboutImage = await sharp(file.buffer).metadata()

    const _imagesByTemplates: ImageByTemplateCreation[] = []

    /* save to original size but only convert to webp */
    const _name = `${generateBaseImageName(name)}.webp`
    sharp(file.buffer)
      .webp()
      .toFile(`${pathForImages}/${_name}`)
    _imagesByTemplates.push({ name: _name, template: 'original' })

    if (_aboutImage.width && _aboutImage.width > 200) {
      /* create image according templates that have in db */
      const _templates: TemplateImage[] = await imageModel.getTemplates()
      if (_templates.length) {
        for (const { width, height, name: template } of _templates) {
          const _name = generateBaseImageName(name, template, width, height) + '.webp'

          sharp(file.buffer)
            .resize(width, height)
            .webp()
            .toFile(`${pathForImages}/${_name}`)

          _imagesByTemplates.push(
            {
              name: _name,
              template,
              width,
              height
            })
        }
      }
    }

    const _image = await imageModel.create({
      description,
      divisionByTemplates: _imagesByTemplates
    })

    return res.status(200).json(_image)
  } catch (e: any) {
    next(createError(500, e.message || 'Error processing data'))
  }
}
