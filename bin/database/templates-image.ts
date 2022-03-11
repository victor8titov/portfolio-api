import { DatabaseMain } from '.'
import { TemplateImage } from './types'

export interface TemplatesImagesInterface {
  getTemplatesImages(): Promise<TemplateImage[]>
}

export class TemplatesImage extends DatabaseMain implements TemplatesImagesInterface {
  async getTemplatesImages (): Promise<TemplateImage[]> {
    try {
      await this._db.connect()
      const _templates = await this._db.query('SELECT * FROM templates_image;')

      return _templates.rows.map<TemplateImage>(item => ({
        id: item.template_image_id,
        name: item.name,
        width: item.width,
        height: item.height,
        suffix: item.suffix
      }))
    } catch (e: any) {
      console.error(e)
      throw new Error(e.message)
    } finally {
      await this._db.end()
    }
  }
}
