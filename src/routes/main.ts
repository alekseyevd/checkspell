import { Context } from '../interfaces/IRoute';

export default async function mainRoute (ctx: Context) : Promise<any> {
  // res.writeHead(200, {'Content-Type': 'text/html'})
  // res.write('<form action="/api/v1/" method="post" enctype="multipart/form-data">')
  // res.write('<input type="file" name="filetoupload"><br>')
  // res.write('<input type="submit">')
  // res.write('</form>')
  // return res.end()
  console.log(ctx.req.headers);
  return 'jt'
}
