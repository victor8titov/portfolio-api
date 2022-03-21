import path from 'path'
import { DatabaseMain } from '.'
import { Image } from '../../app/models/image'
import { urlForStaticImages } from '../common/paths'

type ImageLineDB = {
  id: string
  name: string
  description: string
  width: number | null
  height: number | null
  template: string
}

export interface ImagesInterface {
  getImages(id: string): Promise<Omit<Image, 'url'>[]>
  createImages(images: Omit<Image, 'url'>[]): Promise<void>
  deleteImage(id: string): Promise<void>
}

export class Images extends DatabaseMain implements ImagesInterface {
  async getImages (id: string): Promise<Image[]> {
    try {
      await this._db.connect()
      const { rows } = await this._db.query<ImageLineDB>(`
        SELECT image_id as id, name, description, width, height, template_name as template
          FROM images WHERE image_id = '${id}';
        `)

      return rows.map<Image>((item) => {
        const { id, name, description, width, height, template: templateName = '' } = item
        return { id, name, description, width, height, templateName, url: path.resolve(urlForStaticImages, name) }
      })
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await this._db.end()
    }
  }

  async createImages (images: Omit<Image, 'url'>[]): Promise<void> {
    try {
      await this._db.connect()

      const _values = images.map(item => {
        const { id, name, description = '', width = null, height = null, templateName = '' } = item
        return `('${id}', '${name}', '${description}', ${width}, ${height}, '${templateName}')`
      })

      await this._db.query(`
        INSERT INTO images (image_id, name, description, width, height, template_name)
          VALUES ${_values.join(', ')};
        `)
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await this._db.end()
    }
  }

  async deleteImage (id: string): Promise<void> {
    try {
      await this._db.connect()
      await this._db.query(`DELETE FROM images WHERE image_id = '${id}';`)
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await this._db.end()
    }
  }
}
