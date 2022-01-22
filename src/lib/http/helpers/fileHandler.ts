import fs from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'
import stream from 'stream';

const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const iv = crypto.randomBytes(16);

export default async function fileUploadHandler (file: stream.Readable, params: any) {
  if (!params.filename) throw new Error('Invalid filename...')
  return new Promise((resolve, reject) => {
    const encrypt = crypto.createCipheriv(algorithm, secretKey, iv);

    const fileName = path.join(os.tmpdir(), `[${Date.now()}]_${params.filename}`)
    const stream = fs.createWriteStream(fileName)

    file
      .pipe(encrypt)
      .pipe(stream)
      .on('finish', () => resolve(fileName))
      .on('error', (error: Error) => reject(error))
  })
}