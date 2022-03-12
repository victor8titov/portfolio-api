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
