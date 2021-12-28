import { Context } from '../interfaces/IRoute'

export default function testRoute (context: Context) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      //console.log(context);
      resolve(context)
    }, 0)
  })
}
