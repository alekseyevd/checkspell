import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http'
import stream from 'stream'
import bodyParser from './bodyParser';
import fileUploadHandler from './helpers/fileHandler';
import getQueryParams from './helpers/getQueryParams';

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

  get body(): any

  get files(): any

  get headers(): IncomingHttpHeaders

  get params(): { [key: string]: string }

  get query(): { [key: string]: string }

  get(key: string): any

  set(key: string, value: any): void

  parseBody(): Promise<IContext>

  saveToFile(params: any): Promise<IContext>
}

export class Context implements IContext {
  url: URL
  private _path: string | RegExp
  private _params: Array<string>
  private _res: ServerResponse
  private _req: IncomingMessage
  private _options: any
  private _body: any
  private _files: any
  private _file: string | undefined
  private _map: Map<string, any>

  constructor(params: any) {
    this.url = params.url
    this._path = params.path
    this._params = params.params
    this._res = params.res
    this._req = params.req
    this._options = params.options
    this._map = new Map()
    // this.parseRequest = memoize(this.parseRequest.bind(this))
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
    // todo check if method parseBody was called
    return this._body
  }

  get files() {
    // todo check if method parseBody was called
    return this._files
  }

  get file() {
    return this._file
  }

  get headers() {
    return this._req.headers
  }

  get query() {
    return getQueryParams(this.url)
  }

  get params() {
    const params : { [key: string]: string } = {}
    if (this._path instanceof RegExp) {
      const values = this.url.pathname.match(this._path)?.slice(1) || []
      
      for (let i = 0; i < this._params.length; i++) {
        params[this._params[i]] = values[i]
      }
      return params
    }

    return params
  }

  get(key: string) {
    return this._map.get(key)
  }

  set(key: string, value: any): void {
    this._map.set(key, value)
  }

  async parseBody() {
    // todo check if req is ended/ already read
    const { body, files } = await bodyParser(this._req, this._options)
    this._body = body
    this._files = files
    return this
  }

  async saveToFile(params: { path?: string, name?: string } = {}) {
    // todo check if req is ended/ already read
 
    // this._file = await this._handleFile(this._req, {
    //   filename,
    //   ...params
    // })
    this._file = await fileUploadHandler({ 
      file: this._req, 
      ...params
    })

    return this
  }

  // private async _handleFile(file: stream, options: any): Promise<string> {
  //   return fileUploadHandler(file, {
  //     filename: options.filename
  //   })
  // }

  toJSON() {
    return {
      params: this.params,
      query: this.query,
      method: this.method,
    }
  }
}