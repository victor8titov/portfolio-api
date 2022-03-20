import { Client } from 'pg'
import { Images, ImagesInterface } from '../../bin/database/images'
import { TemplatesImage, TemplatesImagesInterface } from '../../bin/database/templates-image'
import { Image, TemplateImage } from '../../bin/database/types'

export async function getTemplatesImage (): Promise<TemplateImage[]> {
  const _db: TemplatesImagesInterface = new TemplatesImage()
  return _db.getTemplatesImages()
}

export async function getImages (id: string): Promise<Omit<Image, 'url'>[]> {
  const _db: ImagesInterface = new Images()
  return _db.getImages(id)
}

export async function createImages (images: Omit<Image, 'url'>[]): Promise<void> {
  const _db: ImagesInterface = new Images()
  return _db.createImages(images)
}

export async function deleteImages (id: string): Promise<void> {
  const _db: ImagesInterface = new Images()
  return _db.deleteImage(id)
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
