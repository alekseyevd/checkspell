import {userModel} from '../components/users/models/User';
import { IContext } from '../lib/http/Context';

export default async function testRoute (context: IContext) {
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
  let body = await context.body
  //console.log(context.get('user'));
  const result = await userModel.findAll({
    fields: ['email'],
    where: "email = '123@asd.we'"
  })
  
  return result
  
}
