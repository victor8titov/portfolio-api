import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import createError from 'http-errors'
import * as model from '../models/image'
import path from 'path'
import { pathForImages } from '../../bin/common/paths'

export async function getById (req: Request, res: Response, next: NextFunction) {
  try {
    const fileId = req.params.fileId

    const _image = await model.getImageById(fileId)

    res.status(200).json(_image as model.ImageView)
  } catch (e: any) {
    next(createError(500, 'Error processing data during getting images.'))
  }
}

export async function getImages (req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 100

    const _answer: model.ListImages = {}
    const items = await model.getListImages({ page, pageSize })

    if (page && pageSize) {
      const _count = await model.getCountImages()
      const totalPages = Math.ceil(_count / pageSize)

      if (page > totalPages) {
        return next(createError(400, 'Page number outside', { source: 'Param page' }))
      }

      _answer.pagination = {
        page,
        pageSize,
        totalPages
      }
    }

    _answer.items = items

    res.status(200).json(_answer)
  } catch (e) {
    next(createError(500, 'Error is during getting projects list'))
  }
}

export async function deleteById (req: Request, res: Response, next: NextFunction) {
  try {
    const fileId = req.params.fileId

    const image = await model.getImageById(fileId)

    if (!image) {
      return next(createError(400, 'Wrong id', {
        source: 'id'
      }))
    }

    await model.deleteImages(fileId)

    function deleteFile (path: string): Promise<void> {
      return new Promise((resolve, reject) => {
        fs.rm(path, (err) => {
          if (err) {
            reject(err)
          }

          resolve()
        })
      })
    }

    for (const imageByTemplate of image.divisionByTemplates) {
      const name = imageByTemplate.name
      if (name) await deleteFile(path.resolve(pathForImages, name))
    }

    res.status(200).json({
      id: fileId,
      message: 'Images deleted successful'
    })
  } catch (e: any) {
    next(createError(500, 'Error processing data during getting images.'))
  }
}
