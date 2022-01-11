import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http'
import formidable from 'formidable'

function memoize(func: Function) {
  let ran = false
  let memo: any
  return function(...args: any) {

    if (ran) return memo;
    ran = true;
    memo = func(...args);
    return memo;
  };
}

export interface IContext {
  url: URL

  get method(): any

  get res(): ServerResponse

  get req(): IncomingMessage

  get body(): Promise<any>

  get files(): Promise<any>

  get headers(): IncomingHttpHeaders

  get params(): { [key: string]: string | number }

  get query(): { [key: string]: any }
}

export class Context implements IContext {
  url: URL
  private _path: string | RegExp
  private _params: Array<string>
  private _res: ServerResponse
  private _req: IncomingMessage

  constructor(params: any) {
    this.url = params.url
    this._path = params.path
    this._params = params.params
    this._res = params.res
    this._req = params.req
    this.parseRequest = memoize(this.parseRequest.bind(this))
  }

  write(str: string): void {
    this._res.write(str)
  }

  get method() {
    return this._req.method ? this._req.method.toLowerCase() : 'get'
  }

  get res() {
    return this._res
  }

  get req() {
    return this._req
  }

  get body() {
    return (async() => {
      const { body } = await this.parseRequest()
      return body
    })()
  }

  get files() {
    return (async() => {
      const { files } = await this.parseRequest()
      return files
    })()
  }

  private async parseRequest() {
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

    return { body: fields, files }
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

  get params() {
    const params : { [key: string]: string | number; } = {}
    if (this._path instanceof RegExp) {
      const values = this.url.pathname.match(this._path)?.slice(1) || []
      
      for (let i = 0; i < this._params.length; i++) {
        //params[route.params[i]] = isNaN(+values[i]) ? values[i] : +values[i]
        params[this._params[i]] = values[i]
      }
      return params
    }

    return params
  }

  toJSON() {
    return {
      params: this.params,
      query: this.query,
      method: this.method,
    }
  }
}

export default interface IRoute {
  method: string,
  path: string,
  action: (context: Context) => Promise<any>
  options?: any
}