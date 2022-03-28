import express, { NextFunction } from 'express'
import createError from 'http-errors'
import { imageModel } from '../models/image'
import * as model from '../models/social-media'

export async function getAll (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const links = await model.getAll()

    const items: model.SocialMediaView[] = []

    for (const { image: imageId, ...rest } of links) {
      let icon
      if (imageId) {
        icon = await imageModel.getById(imageId)
      }
      items.push({
        ...rest,
        ...(icon ? { icon } : {})
      })
    }

    res.status(200).json({ items } as model.SocialMediaList)
  } catch (e) {
    next(createError(500, 'Error during getting all links'))
  }
}

export async function create (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { name, link, imageId } = req.body

    const id = await model.create({ name, link, imageId })

    res.status(200).json({ id, message: 'Social media link is created successfully' })
  } catch (e) {
    next(createError(500, 'Error during creating social media'))
  }
}

export async function update (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { name, link, imageId } = req.body
    const id = req.params.socialMediaId
    await model.update(id, { name, link, imageId })

    res.status(200).json({ id, message: 'Social media link is updated successfully' })
  } catch (e) {
    next(createError(500, 'Error during updating social media'))
  }
}

export async function deleteById (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const id = req.params.socialMediaId
    await model.deleteById(id)

    res.status(200).json({ id, message: 'Social media link is deleted successfully' })
  } catch (e) {
    next(createError(500, 'Error during deleting social media'))
  }
}
