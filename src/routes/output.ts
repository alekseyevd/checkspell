import { IncomingMessage, ServerResponse } from 'http'
import path from 'path'
import fs from 'fs'
import { db } from '../db'
import { URL } from "url"

export default function outputRoute(req: IncomingMessage, res: ServerResponse) : void {
  const url = new URL(req.url || '/', `http://${req.headers.host}` )
  
  if (!url.searchParams.has('id') ) {
    res.statusCode = 404
    return res.end('not found')
  }

  const id = url.searchParams.get('id') || ''
  const item = db.findById(id)
  
  if (!item) {
    res.statusCode = 404
    return res.end(JSON.stringify({ status: 'not found' }))
  }

  if (item.status === 'pending') return res.end(JSON.stringify({ status: 'pending' }))

  const file = path.join(__dirname, '../../output', `${id}`)
  const stat = fs.statSync(file)
  res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Length': stat.size,
      'Content-Disposition': `attachment; filename="${item.filename}"`
  });

  const readStream = fs.createReadStream(file, 'utf8');
  readStream.pipe(res)
}