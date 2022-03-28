import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import createError from 'http-errors'
import { imageModel, ImageView, ListImages } from '../models/image'
import path from 'path'
import { pathForImages } from '../../bin/common/paths'

export async function getById (req: Request, res: Response, next: NextFunction) {
  try {
    const fileId = req.params.fileId

    const _image = await imageModel.getById(fileId)

    res.status(200).json(_image as ImageView)
  } catch (e: any) {
    next(createError(500, 'Error processing data during getting images.'))
  }
}

export async function getImages (req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 100

    const _answer: ListImages = {}
    const items = await imageModel.getList({ page, pageSize })

    if (page && pageSize) {
      const _count = await imageModel.getCount()
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

    const image = await imageModel.getById(fileId)

    if (!image) {
      return next(createError(400, 'Wrong id', {
        source: 'id'
      }))
    }

    await imageModel.delete(fileId)

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
