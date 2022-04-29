import express, { NextFunction } from 'express'
import createError from 'http-errors'
import path from 'path'
import { getMimeType } from '../bin/common/mime-types'
import { pathForImages } from '../bin/common/paths'
import { readFile } from '../bin/common/read-file'

export async function getImage (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const _path = path.parse(req.originalUrl)

    const _fileStoragePath = path.resolve(pathForImages, _path.base)

    const _fileStream = await readFile(_fileStoragePath)

    if (_fileStream instanceof Error) {
      console.log(_fileStream.message)
      return next(createError(404, 'Not found'))
    }

    const _type = getMimeType(_path.ext)
    if (_type) res.set('Content-Type', _type)
    _fileStream.pipe(res)
  } catch (e: any) {
    next(createError(500, e.message || 'Error getting pictures'))
  }
}
