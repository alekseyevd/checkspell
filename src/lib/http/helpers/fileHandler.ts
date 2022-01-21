import fs from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'

const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const iv = crypto.randomBytes(16);

export default async function fileUploadHandler (file: any, params: any) {
  return new Promise((resolve, reject) => {
    if (!params.filename) reject(new Error('Invalid filename...'))

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