import { IncomingMessage, ServerResponse } from 'http'

export interface IRouting {
  [pathname: string] : (req: IncomingMessage, res: ServerResponse) => void
}
