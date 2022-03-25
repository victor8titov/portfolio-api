import { Client } from 'pg'
import { Language, ObjectWithLanguage } from './types'

export type SkillCreation = {
  name: string
  group?: string
  level?: number
  description?: ObjectWithLanguage
}

export type SkillView = Omit<Required<SkillCreation>, 'description'> & {
  id: string
  description: string
}

export type ListSkillsResponse = {
  languages: Language[]
  currentLanguage: Language
  groups: string[]
  items: SkillView[]
}

export async function getNamesSkill (): Promise<{ name: string, id: string }[]> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } = await db.query(`
      SELECT skill_id as id, name FROM skills;
    `)

    return rows
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function getSkillById (skillId: string, language: Language): Promise<SkillView | undefined> {
  const db = new Client()
  try {
    await db.connect()

    const { rows: _skills } = await db.query(`
      SELECT skill_id as id, name, skill_group as group, level FROM skills
      WHERE skill_id = '${skillId}';
    `)

    const _skill = _skills.shift()
    if (!_skill) return undefined

    const { rows: _descriptions } = await db.query(`
      SELECT content as description FROM multilingual_content
        WHERE language = '${language}' AND skill_id = '${skillId}';
    `)

    _skill.description = _descriptions?.shift()?.description || ''

    return _skill
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function getSkills (language: Language): Promise<SkillView[]> {
  const db = new Client()
  try {
    await db.connect()

    const { rows: _skills } = await db.query(`
      SELECT skill_id as id, name, skill_group as group, level FROM skills;
    `)

    for (const _skill of _skills) {
      const { rows: _descriptions } = await db.query(`
        SELECT content as description FROM multilingual_content
          WHERE language = '${language}' AND skill_id = '${_skill.id}';
      `)

      _skill.description = _descriptions.shift()?.description || ''
    }

    return _skills
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function createSkill (skill: SkillCreation): Promise<number> {
  const db = new Client()
  try {
    const { name, group = '', level = 0, description } = skill
    await db.connect()

    await db.query('BEGIN;')

    const { rows: listSkills } = await db.query(`
      INSERT INTO skills 
        (name, skill_group, level)
        VALUES
        ('${name}', '${group}', '${level}')
        RETURNING *;
    `)
    const _skillId = listSkills.shift().skill_id

    if (!_skillId) {
      await db.query('ROLLBACK;')
      throw new Error('There is Error during processing create skill in database')
    }

    if (description) {
      const _languages = Object.keys(description)

      const _values = _languages.map((_language) =>
        `('${_skillId}', '${_language}', '${description[_language as Language] || null}')`)

      await db.query(`
        INSERT INTO multilingual_content
          (skill_id, language, content)
          VALUES 
            ${_values.join(', ')};
      `)
    }

    await db.query('COMMIT;')

    return _skillId
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function updateSkill (skillId: string, skill: SkillCreation): Promise<void> {
  const db = new Client()
  try {
    const { name, group = '', level = 0, description } = skill
    await db.connect()

    await db.query('BEGIN;')

    await db.query(`
      UPDATE skills  SET
        name = '${name}',
        skill_group = '${group}',
        level = ${level}
        WHERE skill_id = '${skillId}'
    `)

    await db.query(`
      DELETE FROM multilingual_content
        WHERE skill_id = '${skillId}'  
    `)
    if (description) {
      const _languages = Object.keys(description)

      const _values = _languages.map((_language) =>
        `('${skillId}', '${_language}', '${description[_language as Language] || null}')`)

      await db.query(`
        INSERT INTO multilingual_content
          (skill_id, language, content)
          VALUES 
            ${_values.join(', ')};
      `)
    }

    await db.query('COMMIT;')
  } catch (e: any) {
    await db.query('ROLLBACK;')
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function deleteSkill (skillId: string): Promise<void> {
  const db = new Client()
  try {
    await db.connect()

    await db.query(`
      DELETE FROM skills
        WHERE skill_id = '${skillId}'
    `)
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function getGroups (): Promise<string[]> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } = await db.query(`
      SELECT skill_group as group FROM skills
        GROUP BY skill_group;
    `)
    return rows.map(i => i.group)
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}
