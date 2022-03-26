import { Client } from 'pg'
import format from 'pg-format'
import { getUrlImage } from '../../bin/common/paths'
import { OptionsRequest, Pagination } from './types'

export type TemplateImage = {
  readonly name: string
  readonly width: number | null
  readonly height?: number | null
}

export type ImageByTemplateView = {
  url: string
  name: string
  template: string
  width?: number | null | string
  height?: number | null | string
}

export type ImageByTemplateCreation = Omit<ImageByTemplateView, 'url'>

export type ImageView = {
  id: string
  description: string
  divisionByTemplates: ImageByTemplateView[]
}

export type ImageCreation = Omit<ImageView, 'id' | 'divisionByTemplates'> & {
  divisionByTemplates: ImageByTemplateCreation[]
}

export type ListImages = {
  pagination?: Pagination
  currentLanguage?: string
  supportedLanguages?: string[]
  items?: ImageView[]
}

export async function getTemplatesImage (): Promise<TemplateImage[]> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } =
      await db.query<TemplateImage>('SELECT name, width, height FROM templates_image;')

    return rows
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  } finally {
    await db.end()
  }
}

export async function getCountImages (): Promise<number> {
  const db = new Client()
  try {
    await db.connect()

    const { rows } = await db.query('SELECT COUNT( * ) FROM images;')
    return parseInt(rows.shift().count)
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    db.end()
  }
}

export async function queryGetImageById (db: Client, id: string): Promise<ImageView> {
  const { rows: _imagesList } = await db.query<{ id: string, description: string }>(`
        SELECT image_id as id, description FROM images
          WHERE image_id = $1;
        `, [id])
  const _image = _imagesList.shift()

  if (!_image) {
    throw new Error('Error during getting image entity')
  }

  const { rows: _divisionByTemplates } =
      await db.query<{ name: string, template: string, width: string | null, height: string | null}>(`
        SELECT name, template_name as template, width, height 
          FROM images_division_by_template
          WHERE image_id = $1
          ORDER BY name;
        `, [_image.id])

  return {
    ..._image,
    divisionByTemplates: _divisionByTemplates.map(i => ({ ...i, url: getUrlImage(i.name) }))
  }
}

export async function getImageById (id: string): Promise<ImageView> {
  const db = new Client()
  try {
    await db.connect()

    return await queryGetImageById(db, id)
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  } finally {
    await db.end()
  }
}

export async function getListImages (option: OptionsRequest): Promise<ImageView[]> {
  const db = new Client()
  try {
    const { page = 1, pageSize = 100 } = option

    await db.connect()

    const { rows } = await db.query<{ id: string }>(`
      SELECT image_id as id
        FROM images 
        LIMIT $1
        OFFSET $2;
    `, [pageSize, ((page - 1) * pageSize)])

    const _images: ImageView[] = []

    for (const { id } of rows) {
      const _image = await queryGetImageById(db, id)
      _images.push(_image)
    }

    return _images
  } catch (e: any) {
    console.error(e)
    throw e
  } finally {
    await db.end()
  }
}

export async function getListImagesId (): Promise<string[]> {
  const _db = new Client()
  try {
    await _db.connect()

    const _imagesIdRows = await _db.query<{id: string}>(`
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

export async function createImages (image: ImageCreation): Promise<ImageView> {
  const db = new Client()
  try {
    const { description, divisionByTemplates } = image
    await db.connect()

    await db.query('BEGIN;')

    const { rows } = await db.query<{ id: string }>(`
      INSERT INTO images
        (description)  
        VALUES
        ($1)
        RETURNING image_id as id;
    `, [description])
    const id = rows.shift()?.id

    if (!id) {
      await db.query('ROLLBACK;')
      throw new Error('Error during creating image')
    }

    const _values = divisionByTemplates.map(i => [id, i.name, i.template, i.width, i.height])

    const _query = format(`
      INSERT INTO images_division_by_template
        (image_id, name, template_name, width, height)
        VALUES %L
        RETURNING name, template_name as template, width, height;
      `, _values)
    const { rows: _divisionByTemplates } = await db.query<{ name: string, template: string, width: string, height: string}>(_query)

    await db.query('COMMIT;')
    return {
      id,
      description,
      divisionByTemplates: _divisionByTemplates.map(i => ({ ...i, url: getUrlImage(i.name) }))
    }
  } catch (e: any) {
    await db.query('ROLLBACK;')
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

    await db.query('DELETE FROM images WHERE image_id = $1;', [id])
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  } finally {
    await db.end()
  }
}
