import { Context } from '../interfaces/IRoute'
import YaSpellTransform from '../classes/YaSpellTransform'

export default async function testRoute (context: Context) {
  // return new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     //console.log(context);
  //     resolve(context)
  //   }, 0)
  // })
  //const stream = new YaSpellTransform()
  //console.log('stream', stream instanceof require("stream").Writable);
  //Object.keys(context.files)

  //context.files[key].buffer.toString()
  return context.query
  
}
