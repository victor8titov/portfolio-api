import path from 'path'
import { generateId } from './generate-id'

export const urlForStaticImages = '/public/images'
export const pathForImages = path.resolve(__dirname, '../../public', 'images')

export function getUrlImage (name: string): string {
  return path.resolve(urlForStaticImages, name)
}

export function generateBaseImageName (
  name: string,
  templateName = 'original',
  width?: string | number | null,
  height?: string | number | null) {
  const id = generateId(10)
  return `${name}${width ? '-' + width : ''}${height ? 'x' + height : ''}-${templateName}-${id}`
}
