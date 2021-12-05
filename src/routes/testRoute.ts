import { IncomingMessage, ServerResponse } from 'http'
import { Context } from '../interfaces/IRoute'

export default function testRoute (context: Context) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(context);
      resolve('test')
    }, 0)
  })
}
