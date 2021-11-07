import { IncomingMessage, ServerResponse } from 'http'

export default function testRoute (req: IncomingMessage, res: ServerResponse) {
  res.end('test')
}
