import { Client } from 'pg'
import format from 'pg-format'
import Model from '.'
import { transformToMultilingualObject } from '../../bin/common/transform-to-multilingual-object'
import { languageModel } from './language'
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
  currentLanguage?: Language
}

export type SkillViewMultilingual = Required<SkillCreation> & {
  id: string
}

export type ListSkillsResponse = {
  languages: Language[]
  currentLanguage: Language
  groups: string[]
  items: SkillView[]
}

class SkillModel extends Model {
  async getSkillName (): Promise<{ name: string, id: string }[]> {
    return this.connect(async (client) => {
      const { rows } = await client.query(`
        SELECT skill_id as id, name FROM skills;
      `)

      return rows
    })
  }

  async getById (skillId: string, language: Language): Promise<SkillView | undefined> {
    return this.connect(async (client) => {
      const { rows: _skills } = await client.query(`
        SELECT skill_id as id, name, skill_group as group, level FROM skills
          WHERE skill_id = $1;
      `, [skillId])

      const _skill = _skills.shift()
      if (!_skill) return undefined

      _skill.description = await this.queryGetDescription(client, skillId, language)

      _skill.currentLanguage = language

      return _skill
    })
  }

  async getByIdMultilingual (skillId: string): Promise<SkillViewMultilingual | undefined> {
    return this.connect(async (client) => {
      const { rows: _skills } = await client.query(`
        SELECT skill_id as id, name, skill_group as group, level FROM skills
          WHERE skill_id = $1;
      `, [skillId])

      const _skill = _skills.shift()
      if (!_skill) return undefined

      const languages = await languageModel.queryGetAll(client)
      const _description = await this.queryGetDescriptions(client, skillId)
      _skill.description = transformToMultilingualObject(_description, languages, 'description')

      return _skill
    })
  }

  async getAll (language: Language): Promise<ListSkillsResponse> {
    return this.connect(async (client) => {
      const { rows } = await client.query<{ id: string, name: string, group: string, level: number }>(`
        SELECT skill_id as id, name, skill_group as group, level 
          FROM skills
          ORDER BY name;
      `)

      const items: SkillView[] = []
      for (const _skill of rows) {
        const description = await this.queryGetDescription(client, _skill.id, language)
        items.push({
          ..._skill,
          description
        })
      }

      const groups = await this.queryGetGroups(client)

      const languages = await languageModel.queryGetAll(client)

      return {
        languages,
        currentLanguage: language,
        groups,
        items
      }
    })
  }

  async create (skill: SkillCreation): Promise<number> {
    return this.connectWitTransaction(async (client) => {
      const { name, group = '', level = 0, description } = skill

      const { rows } = await client.query(`
        INSERT INTO skills 
          (name, skill_group, level)
          VALUES 
          ($1, $2, $3)
          RETURNING skill_id as id;
        `, [name, group, level])

      const _skillId = rows.shift().id

      if (!_skillId) {
        throw new Error('There is Error during processing create skill in database')
      }

      await this.queryUpdateDescription(client, _skillId, description)

      return _skillId
    })
  }

  async update (skillId: string, skill: SkillCreation): Promise<void> {
    return this.connectWitTransaction(async (client) => {
      const { name, group = '', level = 0, description } = skill

      await client.query(`
        UPDATE skills  SET
          name = $1,
          skill_group = $2,
          level = $3
          WHERE skill_id = $4;
      `, [name, group, level, skillId])

      await this.queryUpdateDescription(client, skillId, description)
    })
  }

  async deleteById (skillId: string): Promise<void> {
    return this.connect(async (client) => {
      await client.query(`
        DELETE FROM skills
          WHERE skill_id = $1;
        `, [skillId])
    })
  }

  async queryGetDescription (client: Client, skillId: string, language: Language): Promise<string> {
    const { rows } = await client.query(`
      SELECT content as description FROM multilingual_content
        WHERE language = $1 AND skill_id = $2;
      `, [language, skillId])
    return rows[0]?.description || ''
  }

  async queryGetDescriptions (client: Client, skillId: string): Promise<{ language: Language, description: string }[]> {
    const { rows } = await client.query(`
      SELECT content as description, language FROM multilingual_content
        WHERE skill_id = $1;
      `, [skillId])
    return rows || []
  }

  async queryUpdateDescription (client: Client, skillId: string, description: ObjectWithLanguage | undefined | null): Promise<void> {
    await client.query(`
      DELETE FROM multilingual_content
        WHERE skill_id = $1;  
      `, [skillId])

    if (description && Object.keys(description).length) {
      const _languages = Object.keys(description)

      const _values = _languages.map((_language) =>
        [skillId, _language, description[_language as Language] || ''])

      const _query = format(`
        INSERT INTO multilingual_content
          (skill_id, language, content)
          VALUES %L;
        `, _values)
      await client.query(_query)
    }
  }

  async queryGetGroups (client: Client): Promise<string[]> {
    const { rows } = await client.query(`
      SELECT skill_group as group FROM skills
        GROUP BY skill_group
        ORDER BY skill_group;
      `)

    return rows.map(i => i.group)
  }
}

export const skillModel = new SkillModel()
