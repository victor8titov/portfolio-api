import express, { NextFunction } from 'express'
import createError from 'http-errors'
import { getLanguages } from '../models/language'
import * as model from '../models/skills'
import { ListSkillsResponse } from '../models/skills'
import { Language } from '../models/types'

export async function getSkills (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const language = req.query.language

    const _supportedLanguages = await getLanguages()
    const _checkingLanguage = _supportedLanguages.some(_lang => language === _lang)
    if (!_checkingLanguage) {
      const _message = `The language is incorrect, possible ${_supportedLanguages.join(', ')}`
      return next(createError(400, _message, { source: 'language' }))
    }

    const skills = await model.getSkills(language as Language)

    const groups = await model.getGroups()

    const response: ListSkillsResponse = {
      currentLanguage: language as Language,
      languages: _supportedLanguages,
      groups,
      items: skills
    }
    res.status(200).json(response)
  } catch (e) {
    next(createError(500, 'Error is during getting skills'))
  }
}

export async function getSkill (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const language = req.query.language

    const _supportedLanguages = await getLanguages()
    const _checkingLanguage = _supportedLanguages.some(_lang => language === _lang)
    if (!_checkingLanguage) {
      const _message = `The language is incorrect, possible ${_supportedLanguages.join(', ')}`
      return next(createError(400, _message, { source: 'language' }))
    }

    const skillId = req.params.skillId

    const skill = await model.getSkillById(skillId, language as Language)

    if (!skill) {
      return next(createError(400, 'Skill with such id does not exists'))
    }

    res.status(200).json({
      currentLanguage: language,
      languages: _supportedLanguages,
      ...skill
    })
  } catch (e) {
    next(createError(500, 'Error is during getting skill'))
  }
}

export async function create (req: express.Request, res: express.Response, next: NextFunction) {
  try {
    const id = await model.createSkill({ ...req.body })

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

    await model.updateSkill(skillId, { ...req.body })
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

    await model.deleteSkill(skillId)
    res.status(200).json({
      id: skillId,
      message: 'Skill deleted successfully'
    })
  } catch (e) {
    next(createError(500, 'Error is during deleting skill'))
  }
}
