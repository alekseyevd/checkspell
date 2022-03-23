import fs from 'fs'
import os from 'os'
import path from 'path'
import stream from 'stream';

export default function fileUploadHandler (params: { file: stream,  path?: string, name?: string }): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileName = params.name ? `[${Date.now()}]_${params.name}` : Date.now().toString()
    const filePath = path.join(params.path || os.tmpdir(), fileName)
    const stream = fs.createWriteStream(filePath)

    params.file
      .pipe(stream)
      .on('finish', () => resolve(filePath))
      .on('error', (error: Error) => reject(error))
  })
}