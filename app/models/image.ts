import { Client } from 'pg'
import { getUrlImage } from '../../bin/common/paths'
import { AvatarRequest, AvatarResponse } from './homepage'

type ImageLineDB = {
  id: string
  name: string
  description: string
  width: number
  height: number | null
  template: string
  type: string
  project?: string
}

export type Image = {
  readonly id?: string
  readonly name?: string
  readonly description?: string | null
  readonly width?: number | null
  readonly height?: number | null
  readonly templateName?: string | null
  readonly url?: string
}

export type TemplateImage = {
  readonly name: string
  readonly width: number
  readonly height?: number | null
}

export async function getTemplatesImage (): Promise<TemplateImage[]> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } = await db.query<TemplateImage>('SELECT * FROM templates_image;')

    return rows
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  } finally {
    await db.end()
  }
}

export async function getImages (id: string): Promise<Omit<Image, 'url'>[]> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } = await db.query<ImageLineDB>(`
        SELECT image_id as id, name, description, width, height, template_name as template
          FROM images WHERE image_id = '${id}';
        `)

    return rows.map<Image>((item) => {
      const { id, name, description, width, height, template: templateName = '' } = item
      return { id, name, description, width, height, templateName, url: getUrlImage(name) }
    })
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  } finally {
    await db.end()
  }
}

export async function getImagesByProjectId (projectId: string): Promise<Omit<Image, 'url'>[]> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } = await db.query<ImageLineDB>(`
        SELECT image_id as id, name, description, width, height, template_name as template
          FROM images WHERE project_id = '${projectId}';
        `)

    return rows.map<Image>((item) => {
      const { id, name, description, width, height, template: templateName = '' } = item
      return { id, name, description, width, height, templateName, url: getUrlImage(name) }
    })
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  } finally {
    await db.end()
  }
}

export async function getListImagesId (): Promise<string[]> {
  const _db = new Client()
  try {
    await _db.connect()

    const _imagesIdRows = await _db.query(`
      SELECT image_id as id FROM images
        GROUP BY image_id;
    `)

    return _imagesIdRows.rows.map(item => item.id) || []
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  } finally {
    await _db.end()
  }
}

export async function createImages (images: Omit<Image, 'url'>[]): Promise<void> {
  const db = new Client()
  try {
    await db.connect()

    const _values = images.map(item => {
      const { id, name, description = '', width = null, height = null, templateName = '' } = item
      return `('${id}', '${name}', '${description}', ${width}, ${height}, '${templateName}')`
    })

    await db.query(`
      INSERT INTO images (image_id, name, description, width, height, template_name)
        VALUES ${_values.join(', ')};
      `)
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  } finally {
    await db.end()
  }
}

export async function deleteImages (id: string): Promise<void> {
  const db = new Client()
  try {
    await db.connect()

    await db.query(`DELETE FROM images WHERE image_id = '${id}';`)
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  } finally {
    await db.end()
  }
}

export async function updateAvatar (avatars: AvatarRequest[]): Promise<void> {
  const db = new Client()
  try {
    await db.connect()

    await db.query(`
      UPDATE images SET
        type_avatar = NULL;
    `)

    for (const avatar of avatars) {
      await db.query(`
        UPDATE images SET
          type_avatar = '${avatar.type}'
          WHERE image_id = '${avatar.imageId}';
      `)
    }
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

    const { rows: types } = await db.query<{type: string}>(`
      SELECT type_avatar as type FROM images
      WHERE type_avatar IS NOT NULL
      GROUP BY type_avatar;
    `)

    const { rows } = await db.query<ImageLineDB>(`
      SELECT image_id as id, name, description, width, height, template_name as template, type_avatar as type  
        FROM images
        WHERE type_avatar IS NOT NULL;
    `)

    return types.map(({ type }) => {
      const images = rows.filter(itemFilter => itemFilter.type === type)
      return {
        type, images
      }
    })
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  } finally {
    await db.end()
  }
}
