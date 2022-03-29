
import crypto from 'crypto'
import { IContext } from '../../../lib/http/Context';
import Route from '../../../lib/puppi/Route';
import { Schema } from '../../../lib/validation/validate';
import Auth from '../models/Auth';

export const bodySchema = Schema({
  type: 'object',
  properties: {
    password: {
      type: 'string'
    },
    email: {
      type: 'string',
      format: 'email'
    }
  },
  required: ['password', 'email']
})

async function register(ctx: IContext) {
  var salt = crypto.randomBytes(128).toString('base64')
  var hmac = crypto.createHmac('sha256', salt);
  const {
    password,
    email,
  } = ctx.body
  const hashedPwd = hmac.update(password).digest('hex');
  return Auth.registerUser(hashedPwd, salt, email)
}

export default new Route({
  path: '/register',
  method: 'post',
  handler: register,
  validate: { body: bodySchema }
})