import { DatabaseMain } from './unessasery-index'
import { TemplateImage } from './unnessasery-types'

export interface TemplatesImagesInterface {
  getTemplatesImages(): Promise<TemplateImage[]>
}

export class TemplatesImage extends DatabaseMain implements TemplatesImagesInterface {
  async getTemplatesImages (): Promise<TemplateImage[]> {
    try {
      await this._db.connect()
      const _templates = await this._db.query<TemplateImage>('SELECT * FROM templates_image;')

      return _templates.rows
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await this._db.end()
    }
  }
}
