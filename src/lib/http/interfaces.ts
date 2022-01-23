import { IncomingMessage } from 'http'
import stream from 'stream'

export interface IFileHandler {
  (stream: stream, args: any) : Promise<any>
}

export interface IBodyParser {
  (req: IncomingMessage, args?: any, fileHandler?: IFileHandler): Promise<{ body?: any, files?: any }>
}
