import { IncomingMessage, ServerResponse } from 'http'

export default interface IRoute {
  method: string,
  path: string,
  action: (req: IncomingMessage, res: ServerResponse) => void
}