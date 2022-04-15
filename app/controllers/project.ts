import express, { NextFunction } from 'express'
import createError from 'http-errors'
import { defaultValue } from '../../bin/config/default-settings'
import { projectModel } from '../models/project'
import { Language } from '../models/types'

export async function getById (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const language = req.query.language
    const projectId = req.params.projectId

    const project = await projectModel.getById(projectId, language as Language)

    if (!project) {
      return next(createError(400, 'Project not found'))
    }

    res.status(200).json(project)
  } catch (e) {
    next(createError(500, 'Error is getting during getting Project'))
  }
}

export async function getByIdMultilingual (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const projectId = req.params.projectId

    const project = await projectModel.getByIdMultilingual(projectId)

    if (!project) {
      return next(createError(400, 'Project not found'))
    }

    res.status(200).json(project)
  } catch (e) {
    next(createError(500, 'Error is getting during getting Project'))
  }
}

export async function getList (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const language = req.query.language as Language
    const page = parseInt(req.query.page as string) || defaultValue.page
    const pageSize = parseInt(req.query.pageSize as string) || defaultValue.pageSize
    const sort = typeof req.query.sort === 'string' ? [req.query.sort] : req.query.sort as string[]

    const options = {
      ...(page ? { page } : {}),
      ...(pageSize ? { pageSize } : {}),
      ...(sort ? { sort } : {}),
      language
    }

    const count = await projectModel.getCount()
    const totalPages = Math.ceil(count / pageSize)

    if (page > totalPages && totalPages) {
      return next(createError(400, 'Page number outside', { source: 'Param page' }))
    }

    const response = await projectModel.getList(options)

    res.status(200).json(response)
  } catch (e) {
    next(createError(500, 'Error is during getting projects list'))
  }
}

export async function create (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const id = await projectModel.create({ ...req.body })

    res.status(200).json({
      id,
      message: 'Project created successfully'
    })
  } catch (e) {
    next(createError(500, 'Error is during creating project'))
  }
}

export async function update (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const projectId = req.params.projectId

    await projectModel.update({ ...req.body }, projectId)

    res.status(200).json({ id: projectId, message: 'Project updated successful' })
  } catch (e) {
    next(createError(500, 'Error during update project'))
  }
}

export async function deleteById (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const projectId = req.params.projectId

    await projectModel.deleteById(projectId)

    res.status(200).json({ id: projectId, message: 'Project deleted successful' })
  } catch (e) {
    next(createError(500, 'Error is during deleting project'))
  }
}
