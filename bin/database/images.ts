import { DatabaseMain } from '.'
import { Image } from './types'

export interface ImagesInterface {
  getImages(id: string): Promise<Image[]>
  createImages(images: Image[]): Promise<void>
  deleteImage(id: string): Promise<void>
}

export class Images extends DatabaseMain implements ImagesInterface {
  async getImages (id: string): Promise<Image[]> {
    try {
      await this._db.connect()
      const _answer = await this._db.query(`SELECT * FROM images WHERE image_id = '${id}';`)

      return _answer.rows.map<Image>((item) => {
        const { image_id: id, name, description, width, height } = item
        return { id, name, description, width, height }
      })
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await this._db.end()
    }
  }

  async createImages (images: Image[]): Promise<void> {
    try {
      await this._db.connect()

      const _values = images.map(item => {
        const { id, name, description, width, height } = item
        return `('${id}', '${name}', '${description}', ${width}, ${height})`
      })

      await this._db.query(`
        INSERT INTO images (image_id, name, description, width, height)
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
