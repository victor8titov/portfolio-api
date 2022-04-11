import express, { NextFunction } from 'express'
import createError from 'http-errors'
import { ListSkillsResponse, skillModel, SkillView, SkillViewMultilingual } from '../models/skills'
import { Language } from '../models/types'

export async function getSkills (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const { language } = req.query
    const skills = await skillModel.getAll(language as Language)

    res.status(200).json(skills as ListSkillsResponse)
  } catch (e) {
    next(createError(500, 'Error is during getting skills'))
  }
}

export async function getSkill (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const language = req.query.language
    const skillId = req.params.skillId

    const skill = await skillModel.getById(skillId, language as Language)

    if (!skill) {
      return next(createError(400, 'Skill with such id does not exists'))
    }

    res.status(200).json(skill as SkillView)
  } catch (e) {
    next(createError(500, 'Error is during getting skill'))
  }
}

export async function getSkillMultilingual (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const skillId = req.params.skillId

    const skill = await skillModel.getByIdMultilingual(skillId)

    if (!skill) {
      return next(createError(400, 'Skill with such id does not exists'))
    }

    res.status(200).json(skill as SkillViewMultilingual)
  } catch (e) {
    next(createError(500, 'Error is during getting skill for all languages'))
  }
}

export async function create (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const id = await skillModel.create({ ...req.body })

    res.status(200).json({
      id,
      message: 'Skill created created successfully'
    })
  } catch (e) {
    next(createError(500, 'Error is during creating skill'))
  }
}

export async function update (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const skillId = req.params.skillId

    await skillModel.update(skillId, { ...req.body })

    res.status(200).json({
      id: skillId,
      message: 'Update made successfully'
    })
  } catch (e) {
    next(createError(500, 'Error is during updating skill'))
  }
}

export async function deleteSkill (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const skillId = req.params.skillId

    await skillModel.deleteById(skillId)

    res.status(200).json({
      id: skillId,
      message: 'Skill deleted successfully'
    })
  } catch (e) {
    next(createError(500, 'Error is during deleting skill'))
  }
}
