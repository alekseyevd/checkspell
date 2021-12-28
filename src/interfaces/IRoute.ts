import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http'

export type Context = {
  url: URL,
  body: object,
  files: object,
  params: object,
  queryParams: object,
  headers: IncomingHttpHeaders,
  user: object | undefined
}

export default interface IRoute {
  method: string,
  path: string,
  action: (context: Context) => Promise<any>
  options?: any
}