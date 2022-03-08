import { HomePage, Language } from './types'
import { DatabaseMain } from '.'

export interface HomePageDataInterface {
  getHomePage(language?: Language): Promise<HomePage[] | undefined>
  createHomePage(homepage: HomePage): Promise<HomePage>
  updateHomePage(homepage: HomePage): Promise<HomePage>
}

export class HomePageData extends DatabaseMain implements HomePageDataInterface {
  async getHomePage (language?: Language): Promise<HomePage[] | undefined> {
    try {
      await this._db.connect()
      let result

      if (language) {
        result = await this._db.query<HomePage>(`SELECT * FROM homepage WHERE language = '${language}'`)
      } else {
        result = await this._db.query<HomePage>('SELECT * FROM homepage')
      }

      return result ? result.rows : undefined
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await this._db.end()
    }
  }

  async createHomePage (homepage: HomePage): Promise<HomePage> {
    try {
      const { language, title, subtitle = null, description } = homepage

      await this._db.connect()

      if (language && title && description) {
        await this._db.query(`
          INSERT INTO homepage (language, title, subtitle, description)
            VALUES ('${language}', '${title}', '${subtitle}', '${description}');
          `)
        return { language }
      } else {
        throw new Error('There is no field Title or Description or language')
      }
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await this._db.end()
    }
  }

  async updateHomePage (homepage: HomePage): Promise<HomePage> {
    try {
      const { language, title, subtitle = null, description } = homepage

      await this._db.connect()

      if (language && title && description) {
        await this._db.query(`
          UPDATE homepage 
            SET title = '${title}',
                subtitle = '${subtitle}',
                description = '${description}'
            WHERE language = '${language}';
          `)
        return { language }
      } else {
        throw new Error('There is no field Title or Description or language')
      }
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await this._db.end()
    }
  }
}
