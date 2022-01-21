
import { IBodyParser } from './interfaces'
import { multipart } from './parsers/multipart'
import { json } from './parsers/json'
import  { form } from './parsers/form'

const parsers = {
  multipart,
  json,
  form
}

const bodyParser: IBodyParser = async (req, options) => {
  console.log(req.headers);
  
  const contentType = req.headers['content-type']
  //console.log(contentType);
  
  if (contentType && contentType.indexOf('multipart/form-data') === 0) {
    // to do multipart
    return await multipart(req, options)
  }
  if (contentType && contentType.indexOf('application/json') === 0) {
    return await json(req, null)
  }
  if (contentType && contentType.indexOf('application/x-www-form-urlencoded') === 0) {
    return await form(req, null)
  }
  throw new Error('invalid content-type')
  
}

export default bodyParser