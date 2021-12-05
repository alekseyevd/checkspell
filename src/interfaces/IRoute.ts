import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http'

export type Context = {
  body: Buffer,
  params: Object,
  queryParams: Object,
  headers: IncomingHttpHeaders
}

export default interface IRoute {
  method: string,
  path: string,
  action: (context: Context) => Promise<any>
}