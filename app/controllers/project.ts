import express, { NextFunction } from 'express'
import createError from 'http-errors'
import { getLanguages } from '../models/language'
import * as model from '../models/project'
import { ProjectListWithPagination } from '../models/project'
import { Language } from '../models/types'

export async function getProject (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const language = req.query.language

    const _supportedLanguages = await getLanguages()
    const _checkingLanguage = _supportedLanguages.some(_lang => language === _lang)
    if (!_checkingLanguage) {
      const _message = `The language is incorrect, possible ${_supportedLanguages.join(', ')}`
      return next(createError(400, _message, { source: 'language' }))
    }

    const projectId = req.params.projectId

    const _project = await model.getProjectById(projectId, language as Language)

    if (!_project) {
      return next(createError(400, 'Project with such id does not exists'))
    }

    res.status(200).json({
      id: projectId,
      languages: _supportedLanguages,
      currentLanguage: language,
      ..._project
    } as model.ProjectResponse)
  } catch (e) {
    next(createError(500, 'Error is getting during getting Project'))
  }
}

export async function getProjects (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { language } = req.query
    const page = parseInt(req.query.page as string) || undefined
    const pageSize = parseInt(req.query.pageSize as string) || undefined
    const sort = typeof req.query.sort === 'string' ? [req.query.sort] : req.query.sort as string[]

    const options = {
      ...(page ? { page } : {}),
      ...(pageSize ? { pageSize } : {}),
      ...(sort ? { sort } : {}),
      language: language as Language
    }

    const items = await model.getProjects(options)

    const supportedLanguages = await getLanguages()
    const _result: ProjectListWithPagination = {
      currentLanguage: language as Language,
      supportedLanguages
    }

    if (page && pageSize) {
      const _count = await model.getCountProjects()
      const totalPages = Math.ceil(_count / pageSize)

      if (page > totalPages) {
        return next(createError(400, 'Page number outside', { source: 'Param page' }))
      }

      _result.pagination = {
        page,
        pageSize,
        totalPages
      }
    }

    if (sort) {
      _result.sorted = sort
    }

    _result.items = items

    res.status(200).json(_result)
  } catch (e) {
    next(createError(500, 'Error is during getting projects list'))
  }
}

export async function create (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const id = await model.createProject({ ...req.body })

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

    await model.updateProject({ ...req.body }, projectId)

    res.status(200).json({ id: projectId, message: 'Project updated successful' })
  } catch (e) {
    next(createError(500, 'Error '))
  }
}

export async function deleteProject (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const projectId = req.params.projectId

    await model.deleteProject(projectId)

    res.status(200).json({ id: projectId, message: 'Project deleted successful' })
  } catch (e) {
    next(createError(500, 'Error is during deleting project'))
  }
}
