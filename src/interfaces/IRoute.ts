import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http'
import formidable from 'formidable'

export class Context {
  url: URL
  params: object
  user: object | undefined
  private _res: ServerResponse
  private _req: IncomingMessage

  constructor(params: any) {
    this.url = params.url
    this.params = params.params
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

  get body() {
    return (async () => {
      const fileMeta: {[key:string] : any} = {}
      let filesMeta: Array<any>
      const form = formidable()
      form.onPart = part => {
        if (!part.filename) {
          form.handlePart(part)
          return
        }
        fileMeta[part.name] = {
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
        form.parse(this._req, (error, fields) => {
          if (error) {
            reject(error)
            return
          }
          resolve({ fields, files: filesMeta})
        })
      })
      return { fields, files }
    })()
  }

  get headers() {
    return this._req.headers
  }

  get query() {
    const queryParams: { [key: string]: any } = {}
    this.url.searchParams.forEach((value, key) => {
      let decodedKey = decodeURIComponent(key)
      let decodedValue = decodeURIComponent(value)
      if (decodedKey.endsWith('[]')) {
        decodedKey = decodedKey.replace("[]", "")
        queryParams[decodedKey] || (queryParams[decodedKey] = [])
        queryParams[decodedKey].push(decodedValue)
      } else {
        queryParams[decodedKey] = decodedValue
      }
    })
    return queryParams
  }
}

export default interface IRoute {
  method: string,
  path: string,
  action: (context: Context) => Promise<any>
  options?: any
}