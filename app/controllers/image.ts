import express, { NextFunction } from 'express'
import fs from 'fs'
import createError from 'http-errors'
import * as model from '../models/image'
import path from 'path'
import { pathForImages } from '../../bin/common/paths'

export async function getById (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const fileId = req.params.fileId

    const _image = await model.getImageById(fileId)

    res.status(200).json(_image as model.ImageView)
  } catch (e: any) {
    next(createError(500, 'Error processing data during getting images.'))
  }
}

export async function deleteById (req: express.Request, res: express.Response, next: NextFunction) {
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
