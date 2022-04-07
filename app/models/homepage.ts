import { Client } from 'pg'
import format from 'pg-format'
import Model from '.'
import { imageModel, ImageView } from './image'
import { languageModel } from './language'
import { Language, ObjectWithLanguage, Options } from './types'

export type AvatarCreation = {
  readonly type: string
  readonly imageId: string
}

export type AvatarView = {
  readonly type: string
  readonly image: ImageView
}

export type HomePageView = {
  readonly currentLanguage: Language
  readonly languages: Language[]
  readonly title: string
  readonly subtitle: string
  readonly description: string
  readonly avatars: AvatarView[] | null
}

export type HomePageMultilingual = {
  readonly languages: Language[]
  readonly title?: ObjectWithLanguage
  readonly subtitle?: ObjectWithLanguage
  readonly description?: ObjectWithLanguage
  readonly avatars: AvatarView[] | null
}

export type HomePageCreation = {
  readonly title?: ObjectWithLanguage
  readonly subtitle?: ObjectWithLanguage
  readonly description?: ObjectWithLanguage
  readonly avatars?: AvatarCreation[] | null
}

class HomePageModel extends Model {
  async get (options: Options): Promise<HomePageView | undefined> {
    return this.connect(async (client) => {
      const { language: currentLanguage } = options
      if (!currentLanguage) return undefined

      const languages = await languageModel.queryGetAll(client)

      const { rows } = await client.query<{title: string, subtitle: string, description: string}>(`
      SELECT title, subtitle, description 
        FROM homepage 
        WHERE language = $1;
      `, [currentLanguage])

      const _line = rows.shift()
      if (!_line) return undefined

      const avatars = await this.queryGetAvatars(client)

      return {
        currentLanguage,
        languages,
        ..._line,
        avatars
      }
    })
  }

  async getWitAllLanguages (): Promise<HomePageMultilingual | undefined> {
    return this.connect(async (client) => {
      const languages = await languageModel.queryGetAll(client)

      const { rows } = await client.query<{title: string, subtitle: string, description: string, language: Language}>(`
      SELECT title, subtitle, description, language
        FROM homepage;
      `)

      if (!rows.length) return undefined

      const _homePage: any = { title: {}, subtitle: {}, description: {} }

      for (const language of languages) {
        const filtered = rows.filter(i => i.language === language).shift()
        if (!filtered) continue
        _homePage.title[language] = filtered.title
        _homePage.subtitle[language] = filtered.subtitle
        _homePage.description[language] = filtered.description
      }

      const avatars = await this.queryGetAvatars(client)

      return {
        languages,
        ..._homePage,
        avatars
      }
    })
  }

  async create (homepage: HomePageCreation): Promise<void | Error> {
    return this.connect(async (client) => {
      const { title, subtitle, description, avatars } = homepage

      /* checking if it was created earlier */
      const { rows } = await client.query(`
        SELECT count( * ) FROM homepage 
          WHERE language IN (SELECT language FROM languages);
      `)
      if (rows.shift().count > 0) {
        return new Error('Already exist homepage')
      }

      const languages = await languageModel.queryGetAll(client)

      const _values: string[][] = []
      languages.forEach((_language) => {
        function getValue (field: ObjectWithLanguage | undefined): string { return field && field[_language] ? field[_language] : '' }
        _values.push([_language, getValue(title), getValue(subtitle), getValue(description)])
      })

      /* save to homepage table */
      const _query = format(`
        INSERT INTO homepage 
          (language, title, subtitle, description)
          VALUES 
          %L;
        `, _values)
      await client.query(_query)

      /* update avatars data for avatars table */
      await this.queryUpdateAvatars(client, avatars)
    })
  }

  async update (homepage: HomePageCreation): Promise<void> {
    return this.connect(async (client) => {
      const { title, subtitle, description, avatars } = homepage

      const languages = await languageModel.queryGetAll(client)

      for (const language of languages) {
        function getValue (field: ObjectWithLanguage | undefined): string { return field && field[language] ? field[language] : '' }
        const _values = [getValue(title), getValue(subtitle), getValue(description), language]

        await client.query(`
          UPDATE homepage 
            SET title = $1,
                subtitle = $2,
                description = $3
            WHERE language = $4;
        `, _values)
      }

      await this.queryUpdateAvatars(client, avatars)
    })
  }

  async queryGetAvatars (client: Client): Promise<AvatarView[]> {
    const avatars: AvatarView[] = []

    const { rows: listAvatars } = await client.query<{type: string, image: string}>(`
      SELECT type_avatar as type, image_id as image FROM avatars
    `)

    for (const { image: imageId, type } of listAvatars) {
      const image = await imageModel.queryGetById(client, imageId)

      avatars.push({
        type: type,
        image
      })
    }

    return avatars
  }

  async queryUpdateAvatars (client: Client, avatars: AvatarCreation[] | null | undefined): Promise<void> {
    await client.query('DELETE FROM avatars;')

    if (avatars) {
      const _values = avatars.map(i => [i.imageId, i.type])
      const _query = format(`
        INSERT INTO avatars 
          (image_id, type_avatar)
          VALUES
          %L;
      `, _values)

      await client.query(_query)
    }
  }
}

export const homePageModel = new HomePageModel()
