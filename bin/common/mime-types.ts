
export const mime: {[key: string]: string} = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  js: 'application/javascript'
}

export function getMimeType (ext: string): string | undefined {
  const _ext = ext.trim().toLowerCase().replace('.', '')
  const _mimeTypes = Object.keys(mime)

  if (_mimeTypes.some(item => item === _ext)) {
    return mime[_ext]
  } else return undefined
}
