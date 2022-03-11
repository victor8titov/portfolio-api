import path from 'path'

export const supportedExtensionImages = ['jpeg', 'jpg', 'png', 'gif', 'webp']
export const regExpCheckImages = /\.(jpeg|jpg|png|gif|webp)/

/* PATH */
export const urlForStaticImages = '/public/images'
export const pathForStatic = path.resolve(__dirname, '../../public')
export const pathForImages = path.resolve(__dirname, '../../public', 'images')
