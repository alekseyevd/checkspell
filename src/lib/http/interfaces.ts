import { IncomingMessage } from 'http'

export interface IBodyParser {
  (req: IncomingMessage, args: any): Promise<{ body: any, files: any }>
}
