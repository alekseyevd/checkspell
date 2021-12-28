import { ServerResponse, IncomingMessage } from 'http'
import path from 'path'
import fs from 'fs'
import mime from './mime'

export default class FileServer {
  private dir: string
  private alias?: string
  private cache: number

  constructor(params: { dir: string, alias?: string, cache?: number }) {
    this.dir = params.dir
    this.alias = params.alias
    this.cache = params.cache || 0
  }

  serveFiles(req: IncomingMessage, res: ServerResponse): void {
    if (req.method?.toLocaleLowerCase() !== 'get') {
      res.statusCode = 405
      res.end()
      return
    }
  
    if (this.alias && req.url && !req.url.startsWith(`/${this.alias}/`)) {
      res.statusCode = 404
      res.end('not found')
      return
    }
    let _url = this.alias && req.url
      ? req.url.replace(this.alias, '')
      : req.url || '/'
    
    if (_url.endsWith('/')) _url += 'index.html'
  
    const fileName = path.join(this.dir, _url)
    const stream = fs.createReadStream(fileName)
    stream.on('error', function() {
        res.writeHead(404);
        res.end();
    });
    //to-do mime type
    const ext = fileName.split('.').pop()
    const mimeType = mime(ext)
  
    res.setHeader('Content-Type', mimeType)
    res.setHeader('Cache-Control', `max-age=${this.cache}`)
    stream.pipe(res);
    return
  }
}

