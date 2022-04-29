import fs from 'fs'
import { Stream } from 'stream'

export async function readFile (path: string): Promise<Stream | Error> {
  return new Promise((resolve) => {
    const _stream = fs.createReadStream(path)

    _stream.on('open', function () {
      resolve(_stream)
    })

    _stream.on('error', function (err: Error) {
      resolve(err)
    })
  })
}
