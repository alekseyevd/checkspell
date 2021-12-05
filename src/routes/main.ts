import { IncomingMessage, ServerResponse } from 'http'

export default function mainRoute (ctx: any, res: ServerResponse) : void {
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.write('<form action="/api/v1/" method="post" enctype="multipart/form-data">')
  res.write('<input type="file" name="filetoupload"><br>')
  res.write('<input type="submit">')
  res.write('</form>')
  return res.end()
}
