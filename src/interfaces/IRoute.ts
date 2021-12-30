import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http'
import formidable from 'formidable'

export class Context {
  url: URL
  body: object
  private _files: object | undefined
  private _body: object | undefined
  params: object
  queryParams: object
  headers: IncomingHttpHeaders
  user: object | undefined
  private _res: ServerResponse
  private _req: IncomingMessage

  constructor(params: any) {
    this.url = params.url
    this.body = params.body
    this.params = params.params
    this.queryParams = params.queryParams
    this.headers = params.headers
    this.user = params.user
    this._res = params.res
    this._req = params.req
  }

  write(str: string): void {
      this._res.write(str)
  }

  get res() {
    return this._res
  }

  get req() {
    return this._req
  }

  get files() {
    return (async () => {
      if (!this._files) {
        const { fields, files } = await new Promise((resolve, reject) => {
          formidable().parse(this._req, (error, fields, files) => {
            if (error) {
              reject(error)
              return
            }
            resolve({ fields, files})
          })
        })
        this._files = files
        this._body = fields
      }
      return this._files
    })()
  }
}

export default interface IRoute {
  method: string,
  path: string,
  action: (context: Context) => Promise<any>
  options?: any
}