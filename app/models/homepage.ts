import { Client } from 'pg'
import format from 'pg-format'
import { getUrlImage } from '../../bin/common/paths'
import { ImageView } from './image'
import { Language, ObjectWithLanguage, OptionsRequest } from './types'

type HomepageLineDB = {
  title: string
  subtitle: string
  description: string
}

export type AvatarRequest = {
  type: string
  imageId: string
}

export type AvatarResponse = {
  type: string
  image: ImageView
}

export type HomePage = {
  // TODO нужно убрать или разбить на несколько типов
  readonly language?: Language
  readonly currentLanguage?: Language
  readonly languages?: Language[]
  readonly title?: string
  readonly subtitle?: string
  readonly description?: string
  readonly avatars?: AvatarResponse[] | null
}

export type HomePageRequest = {
  readonly title?: ObjectWithLanguage
  readonly subtitle?: ObjectWithLanguage
  readonly description?: ObjectWithLanguage
  readonly avatars?: AvatarRequest[] | null
}

export async function getHomePage (options: OptionsRequest): Promise<HomePage | undefined> {
  const db = new Client()
  try {
    const { language } = options
    if (!language) return undefined

    await db.connect()

    const { rows } = await db.query<HomepageLineDB>(`
      SELECT title, subtitle, description 
        FROM homepage 
        WHERE language = '${language}';
      `)

    const _line = rows.shift()
    if (!_line) return undefined
    const { title, subtitle, description } = _line

    return { title, subtitle, description }
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function createHomePage (homepage: HomePageRequest): Promise<void | Error> {
  const db = new Client()
  try {
    const { title, subtitle, description } = homepage

    await db.connect()

    const { rows } = await db.query(`
      SELECT count( * ) FROM homepage 
        WHERE language IN (SELECT language FROM languages);
    `)
    if (rows.shift().count > 0) {
      return new Error('Already exist homepage')
    }

    const { rows: languages } = await db.query<{ language: Language }>('SELECT language FROM languages;')

    const values: string[] = []
    languages.forEach(({ language }) => {
      function getValue (field: ObjectWithLanguage | undefined): string { return field && field[language] ? field[language] : '' }
      values.push(`('${language}', '${getValue(title)}', '${getValue(subtitle)}', '${getValue(description)}')`)
    })

    await db.query(`
      INSERT INTO homepage 
        (language, title, subtitle, description)
        VALUES 
        ${values.join(', ')};
      `)
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function updateHomePage (homepage: HomePageRequest): Promise<void> {
  const db = new Client()
  try {
    const { title, subtitle, description } = homepage

    await db.connect()

    const { rows: languages } = await db.query<{ language: Language }>('SELECT language FROM languages;')

    for (const { language } of languages) {
      function getValue (field: ObjectWithLanguage | undefined): string { return field && field[language] ? field[language] : '' }
      await db.query(`
        UPDATE homepage 
          SET title = '${getValue(title)}',
              subtitle = '${getValue(subtitle)}',
              description = '${getValue(description)}'
          WHERE language = '${language}';
        `)
    }
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function updateAvatar (avatars: AvatarRequest[]): Promise<void> {
  const db = new Client()
  try {
    await db.connect()

    await db.query('DELETE FROM avatars;')

    const _values = avatars.map(i => [i.imageId, i.type])
    const _query = format(`
      INSERT INTO avatars 
        (image_id, type_avatar)
        VALUES
        %L;
    `, _values)

    await db.query(_query)
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  } finally {
    await db.end()
  }
}

export async function getAvatars (): Promise<AvatarResponse[]> {
  const db = new Client()
  try {
    await db.connect()

    const avatars: AvatarResponse[] = []

    const { rows: listAvatars } = await db.query<{type: string, imageid: string}>(`
      SELECT type_avatar as type, image_id as imageid FROM avatars
    `)

    for (const { imageid, type } of listAvatars) {
      const { rows: imagesList } = await db.query<{ id: string, description: string }>(`
        SELECT image_id as id, description FROM images
          WHERE image_id = $1;
        `, [imageid])
      const image = imagesList.shift()

      if (!image) {
        throw new Error('Error during getting image entity')
      }

      const { rows: divisionByTemplates } =
        await db.query<{ name: string, template: string, width: string | null, height: string | null}>(`
          SELECT name, template_name as template, width, height 
            FROM images_division_by_template
            WHERE image_id = $1
            ORDER BY name;
          `, [image.id])

      avatars.push({
        type: type,
        image: {
          ...image,
          divisionByTemplates: divisionByTemplates.map(i => ({ ...i, url: getUrlImage(i.name) }))
        }
      })
    }
    return avatars
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  } finally {
    await db.end()
  }
}
