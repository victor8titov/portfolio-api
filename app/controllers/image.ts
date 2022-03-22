import express, { NextFunction } from 'express'
import fs from 'fs'
import createError from 'http-errors'
import { deleteImages, getImages } from '../models/image'
import path from 'path'
import { pathForImages } from '../../bin/common/paths'

export async function getImage (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const fileId = req.params.fileId

    const _images = await getImages(fileId)

    if (!_images.length) {
      return next(createError(400, 'File with such id does not exist', {
        source: 'No exist'
      }))
    }

    res.status(200).json({
      id: fileId,
      items: _images.map(item => {
        const { id, ...rest } = item
        return { ...rest }
      })
    })
  } catch (e: any) {
    next(createError(500, 'Error processing data during getting images.'))
  }
}

export async function deleteImage (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const fileId = req.params.fileId

    const _images = await getImages(fileId)

    if (!_images.length) {
      return next(createError(400, 'Wrong id', {
        source: 'id'
      }))
    }

    await deleteImages(fileId)

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

    for (const _image of _images) {
      // TODO chek this !
      if (_image.name) await deleteFile(path.resolve(pathForImages, _image.name))
    }

    res.status(200).json({
      id: fileId,
      message: 'Images deleted successful'
    })
  } catch (e: any) {
    next(createError(500, 'Error processing data during getting images.'))
  }
}
