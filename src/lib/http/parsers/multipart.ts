import formidable from 'formidable'
import fs from 'fs'
import { IncomingMessage } from 'http'
import os from 'os'
import path from 'path'
import { IBodyParser } from '../interfaces'

async function fileHandler (file: any, params: any) {
  return new Promise((resolve, reject) => {
    const fileName = path.join(os.tmpdir(), params.filename)
    const stream = fs.createWriteStream(fileName)
    file
      .pipe(stream)
      .on('finish', () => resolve(fileName))
      .on('error', (error: Error) => reject(error))
  })
}

export const multipart: IBodyParser = async (req: IncomingMessage) => {
  const fileMeta: {[key:string] : any} = {}
  const form = formidable()
  form.onPart = (part) => {
    if (!part.filename) {
      form.handlePart(part)
      return
    }

    fileMeta[part.name] = fileHandler(part, { 
      name: part.name,
      filename: part.filename
    })
  }

  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, async (error, fields) => {
      if (error) {
        reject(error)
        return
      }
  
      for (const key in fileMeta) {
        fileMeta[key] = await fileMeta[key]
      }
      resolve({ fields, files: fileMeta })
    })
  })

  return { body: fields, files }
}
