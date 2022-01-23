import formidable from 'formidable'
import { IncomingMessage } from 'http'
import { IBodyParser } from '../interfaces'
import fileUploadHandler from '../helpers/fileHandler'

export const multipart: IBodyParser = async (req: IncomingMessage, _, fileHandler) => {
  const fileMeta: {[key:string] : any} = {}
  const form = formidable()
  form.onPart = (part) => {
    if (!part.filename) {
      form.handlePart(part)
      return
    }

    if (fileHandler) {
      fileMeta[part.name] = fileHandler(part, { 
        name: part.name,
        filename: part.filename
      })
    }
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
