import { Client } from 'pg'
import Model from '.'
import { Language } from './types'

export async function getLanguages (): Promise<Language[]> {
  const _db = new Client()
  try {
    await _db.connect()

    const _answer = await _db.query(`
      SELECT * FROM languages;
    `)

    return _answer.rows.map(item => item.language)
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  } finally {
    await _db.end()
  }
}

class LanguageModel extends Model {
  async queryGetAll (client: Client): Promise<Language[]> {
    const _answer = await client.query(`
      SELECT * FROM languages;
    `)

    return _answer.rows.map(item => item.language)
  }

  async getAll (): Promise<Language[]> {
    return this.connect(async (client) => {
      return await this.queryGetAll(client)
    })
  }
}

export const languageModel = new LanguageModel()
