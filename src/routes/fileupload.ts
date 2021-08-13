import { IncomingMessage, ServerResponse } from 'http'
import fs from 'fs'
import { db } from '../db'
import { IncomingForm } from 'formidable'
import { queue } from '../queue'

export default function fileuploadRoute(req: IncomingMessage, res: ServerResponse) : void {
  const form = new IncomingForm({ uploadDir: 'temp' })

  form.on('file', function(name, file) {
    if (file.type !== 'text/plain') {
      fs.unlink(file.path, (error) => {
        if (error) console.log('file not deleted')
      })
      return res.end(JSON.stringify({ result: false, message: 'invalid  format type'}))
    }
    
    const id = file.path.split('upload_')[1]
    queue.put({ id, path: file.path })
    
    db.add({ id, status: 'pending', filename: file.name })
    res.end(JSON.stringify({ result: true, data: id }))
  })

  form.on('error', (error) => {
    res.statusCode = 500
    res.end(JSON.stringify({ result: false, message: 'Somethinq went wrong'}))
  })

  form.parse(req, (error, fields, files) => {
    if (error) {
      res.statusCode = 500
      res.end(JSON.stringify({ result: false, message: 'Somethinq went wrong'}))
    }

    if (!files.filetoupload) {
      res.statusCode = 400
      res.end(JSON.stringify({ result: false, message: 'no file'}))
    }
  })
}