import express, { NextFunction } from 'express'
import createError from 'http-errors'
import { SocialMediaList, socialMediaModel } from '../models/social-media'

export async function getAll (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const links = await socialMediaModel.getAll()

    res.status(200).json(links as SocialMediaList)
  } catch (e) {
    next(createError(500, 'Error during getting all links'))
  }
}

export async function create (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { name, link, imageId } = req.body

    const id = await socialMediaModel.create({ name, link, imageId })

    res.status(200).json({ id, message: 'Social media link is created successfully' })
  } catch (e) {
    next(createError(500, 'Error during creating social media'))
  }
}

export async function update (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { name, link, imageId } = req.body
    const id = req.params.socialMediaId
    await socialMediaModel.update(id, { name, link, imageId })

    res.status(200).json({ id, message: 'Social media link is updated successfully' })
  } catch (e) {
    next(createError(500, 'Error during updating social media'))
  }
}

export async function deleteById (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const id = req.params.socialMediaId
    await socialMediaModel.deleteById(id)

    res.status(200).json({ id, message: 'Social media link is deleted successfully' })
  } catch (e) {
    next(createError(500, 'Error during deleting social media'))
  }
}
