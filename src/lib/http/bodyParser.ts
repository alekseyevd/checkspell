
import formidable from 'formidable'
import { IBodyParser } from './interfaces'

const bodyParser: IBodyParser = async (req, options) => {
  const fileMeta: {[key:string] : any} = {}
  let filesMeta: Array<any>
  
  const form = formidable()
  form.onPart = part => {
    if (!part.filename) {
      form.handlePart(part)
      return
    }
    fileMeta[part.name] = {
      name: part.name,
      fileName: part.filename,
      type: part.mime,
      buffer: []
    }

    part.on('data', function (buffer) {
      fileMeta[part.name].buffer.push(buffer)
    })
    part.on('end', function () {
      fileMeta[part.name].buffer = Buffer.concat(fileMeta[part.name].buffer)
      filesMeta = Object.values(fileMeta)
    })
  }

  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, (error, fields) => {
      if (error) {
        reject(error)
        return
      }
      resolve({ fields, files: filesMeta})
    })
  })

  return { body: fields, files }
}

export default bodyParser