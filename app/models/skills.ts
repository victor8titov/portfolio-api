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
  items: SkillView
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
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}



// export async function * (*): Promise<> {
//   const db = new Client()
//   try {
//     await db.connect()

//   } catch (e: any) {
//     console.error(e)
//     throw e
//   } finally {
//     await db.end()
//   }
// }
