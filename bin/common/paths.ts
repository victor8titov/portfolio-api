import path from 'path'

export const urlForStaticImages = '/public/images'
export const pathForImages = path.resolve(__dirname, '../../public', 'images')

export function getUrlImage (name: string): string {
  return path.resolve(urlForStaticImages, name)
}
