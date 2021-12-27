import { ServerResponse, IncomingMessage } from 'http'
import path from 'path'
import fs from 'fs'
import mimeTypes from './mime.types.json'

function extractMime(types: { [key: string] : string }, key: string | undefined) :string | undefined {
  if (!key) return undefined
  return types[key]
}

export class FileServer {
  private dir: string
  private alias?: string
  private cache: number

  constructor(params: { dir: string, alias?: string, cache?: number }) {
    this.dir = params.dir
    this.alias = params.alias
    this.cache = params.cache || 0
  }

  serveFiles(req: IncomingMessage, res: ServerResponse): void {
    if (this.alias && req.url && !req.url.startsWith(`/${this.alias}/`)) {
      res.statusCode = 404
      res.end('not found')
      return
    }
    const _url = this.alias
      ? req.url.replace(this.alias, '')
      : req.url
  
    const fileName = path.join(this.dir, _url)
    const stream = fs.createReadStream(fileName)
    stream.on('error', function() {
        res.writeHead(404);
        res.end();
    });
    //to-do mime type
    const ext = fileName.split('.').pop()
    const mimeType = extractMime(mimeTypes, ext) || 'application/octet-stream'
  
    res.setHeader('Content-Type', mimeType)
    res.setHeader('Cache-Control', `max-age=${this.cache}`)
    stream.pipe(res);
    return
  }
}

