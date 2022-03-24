import { Client } from 'pg'
import { Language } from './types'

export type MultilingualContent = {
  language: Language
  content: string
  id?: number
  project?: number | null | undefined
  skill?: number | null | undefined
}

export async function getMultilingualContentBySkillId (skillId: number): Promise<MultilingualContent[]> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } = await db.query<MultilingualContent>(`
      SELECT language, content FROM multilingual_content 
        WHERE skill_id = '${skillId}';
    `)

    return rows
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function createMultilingualContent (data: MultilingualContent[]): Promise<number> {
  const db = new Client()
  try {
    const { language,} = data
    await db.connect()

    for

    const { rows } = await db.query<MultilingualContent>(`
      INSERT INTO multilingual_content
        (language, content, project_id, skill_id)
        VALUES
        ();
    `)

    return rows
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}
