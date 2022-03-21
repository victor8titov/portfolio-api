import { Language } from './types'
import { DatabaseMain } from '.'
import { HomePage } from '../../app/models/homepage'

export interface HomePageDataInterface {
  getHomePage(language?: Language): Promise<Omit<HomePage, 'imageId' | 'images'>[] | undefined>
  createHomePage(homepage: Omit<HomePage, 'images' | 'image'>): Promise<void>
  updateHomePage(homepage: Omit<HomePage, 'images' | 'image'>): Promise<void>
}

export class HomePageData extends DatabaseMain implements HomePageDataInterface {
  async getHomePage (language?: Language): Promise<Omit<HomePage, 'imageId' | 'images'>[] | undefined> {
    try {
      await this._db.connect()
      let _homepageRows

      if (language) {
        _homepageRows = await this._db.query<Omit<HomePage, 'imageId' | 'images'>>(`SELECT * FROM homepage WHERE language = '${language}'`)
      } else {
        _homepageRows = await this._db.query<Omit<HomePage, 'imageId' | 'images'>>('SELECT * FROM homepage')
      }

      return _homepageRows ? _homepageRows.rows : undefined
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await this._db.end()
    }
  }

  async createHomePage (homepage: Omit<HomePage, 'images' | 'image'>): Promise<void> {
    try {
      const { language, title = '', subtitle = '', description = '', imageId = '' } = homepage

      await this._db.connect()

      if (language && title && description) {
        await this._db.query(`
          INSERT INTO homepage (language, title, subtitle, description, image)
            VALUES ('${language}', '${title}', '${subtitle}', '${description}', '${imageId}');
          `)
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

  async updateHomePage (homepage: Omit<HomePage, 'images' | 'image'>): Promise<void> {
    try {
      const { language, title = '', subtitle = '', description = '', imageId = '' } = homepage

      await this._db.connect()

      if (language && title && description) {
        await this._db.query(`
          UPDATE homepage 
            SET title = '${title}',
                subtitle = '${subtitle}',
                description = '${description}',
                image = '${imageId}'
            WHERE language = '${language}';
          `)
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
