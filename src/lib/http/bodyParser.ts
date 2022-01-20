
import formidable from 'formidable'
import fs from 'fs'
import { IBodyParser } from './interfaces'

async function fileHandler (file: any) {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(file.filename)
    file
    //.on('end', () => resolve(file.filename))
    .pipe(stream)
    .on('finish', () => resolve(file.filename))
  })

  
}

const bodyParser: IBodyParser = async (req, options) => {
  const fileMeta: {[key:string] : any} = {}
  let filesMeta: Array<any> = []

  const form = formidable()
  form.onPart = (part) => {
    if (!part.filename) {
      form.handlePart(part)
      return
    }

    // fileMeta[part.name] = {
    //   name: part.name,
    //   fileName: part.filename,
    //   type: part.mime,
    //   buffer: [],
    // }
    // const stream = fs.createWriteStream(part.filename)

    // part.on('data', function (buffer) {
    //   fileMeta[part.name].buffer.push(buffer)
    //   stream.write(buffer)
    // })
    // part.on('end', function () {
    //   fileMeta[part.name].buffer = Buffer.concat(fileMeta[part.name].buffer)
    //   filesMeta = Object.values(fileMeta)

    // })
    //part.pipe(stream)
    // fileMeta[part.name] = fileHandler(part)
    filesMeta.push(fileHandler(part))
  }

  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, async (error, fields) => {
      if (error) {
        reject(error)
        return
      }
  
      const files = await Promise.all(filesMeta)
      resolve({ fields, files})
      //resolve({ fields, files })
    })
  })

  return { body: fields, files }
}

export default bodyParser