import express, { NextFunction } from 'express'
import createError from 'http-errors'
import { getImagesByProjectId } from '../models/image'
import { getLanguages } from '../models/language'
import * as model from '../models/project'
import { ProjectListWithPagination } from '../models/project'
import { Language } from '../models/types'

export async function getSkills (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    res.status(200).json({
      message: 'getSkills'
    })
  } catch (e) {
    next(createError(500, 'Error is during creating project'))
  }
}

export async function getSkill (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    res.status(200).json({
      message: 'getSkill'
    })
  } catch (e) {
    next(createError(500, 'Error is during creating project'))
  }
}

export async function create (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    res.status(200).json({
      message: 'create'
    })
  } catch (e) {
    next(createError(500, 'Error is during creating project'))
  }
}

export async function update (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    res.status(200).json({
      message: 'update'
    })
  } catch (e) {
    next(createError(500, 'Error is during creating project'))
  }
}

export async function deleteSkill (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    res.status(200).json({
      message: 'delete'
    })
  } catch (e) {
    next(createError(500, 'Error is during creating project'))
  }
}
