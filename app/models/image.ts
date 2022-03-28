import { Client } from 'pg'
import format from 'pg-format'
import Model from '.'
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

export class ImageModel extends Model {
  async queryGetById (client: Client, id: string): Promise<ImageView> {
    const { rows: _imagesList } = await client.query<{ id: string, description: string }>(`
          SELECT image_id as id, description FROM images
            WHERE image_id = $1;
          `, [id])
    const _image = _imagesList.shift()

    if (!_image) {
      throw new Error('Error during getting image entity')
    }

    const { rows: _divisionByTemplates } =
        await client.query<{ name: string, template: string, width: string | null, height: string | null}>(`
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

  async getTemplates (): Promise<TemplateImage[]> {
    return await this.connect<TemplateImage[]>(
      async (client) => {
        const { rows } =
          await client.query<TemplateImage>('SELECT name, width, height FROM templates_image;')

        return rows
      }
    )
  }

  async getCount (): Promise<number> {
    return await this.connect<number>(
      async function () {
        const { rows } = await this.query('SELECT COUNT( * ) FROM images;')
        return parseInt(rows.shift().count)
      }
    )
  }

  async getById (id: string): Promise<ImageView> {
    return await this.connect(async (client) => {
      return await this.queryGetById(client, id)
    })
  }

  async getList (option: OptionsRequest): Promise<ImageView[]> {
    return await this.connect(async (client) => {
      const { page = 1, pageSize = 100 } = option

      const { rows } = await client.query<{ id: string }>(`
        SELECT image_id as id
          FROM images 
          LIMIT $1
          OFFSET $2;
      `, [pageSize, ((page - 1) * pageSize)])

      const _images: ImageView[] = []

      for (const { id } of rows) {
        const _image = await this.queryGetById(client, id)
        _images.push(_image)
      }

      return _images
    })
  }

  async getListId (): Promise<string[]> {
    return await this.connect(async (client) => {
      const _imagesIdRows = await client.query<{id: string}>(`
        SELECT image_id as id FROM images
          GROUP BY image_id;
      `)

      return _imagesIdRows.rows.map(item => item.id) || []
    })
  }

  async create (image: ImageCreation): Promise<ImageView> {
    return await this.connectWitTransaction(async (client) => {
      const { description, divisionByTemplates } = image

      const { rows } = await client.query<{ id: string }>(`
        INSERT INTO images
          (description)  
          VALUES
          ($1)
          RETURNING image_id as id;
      `, [description])
      const id = rows.shift()?.id

      if (!id) {
        throw new Error('Error during creating image')
      }

      const _values = divisionByTemplates.map(i => [id, i.name, i.template, i.width, i.height])

      const _query = format(`
        INSERT INTO images_division_by_template
          (image_id, name, template_name, width, height)
          VALUES %L
          RETURNING name, template_name as template, width, height;
        `, _values)
      const { rows: _divisionByTemplates } = await client.query<{ name: string, template: string, width: string, height: string}>(_query)

      return {
        id,
        description,
        divisionByTemplates: _divisionByTemplates.map(i => ({ ...i, url: getUrlImage(i.name) }))
      }
    })
  }

  async delete (id: string): Promise<void> {
    return await this.connect(async (client) => {
      await client.query('DELETE FROM images WHERE image_id = $1;', [id])
    })
  }
}

export const imageModel = new ImageModel()
