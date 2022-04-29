
import crypto from 'crypto'
import { getModel } from '../../../lib/database';
import { IContext } from '../../../lib/http/Context';
import Route from '../../../lib/puppi/Route';
import { Schema } from '../../../lib/validation/validate';
import { User } from '../../../modules/auth/models/User';
import UserModel from '../../../modules/auth/models/User';
import IErrnoException from '../../../interfaces/IErrnoException';
import HttpError from '../../../lib/http/HttpError';

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

async function register(ctx: IContext): Promise<User> {
  var salt = crypto.randomBytes(128).toString('base64')
  var hmac = crypto.createHmac('sha256', salt);
  const {
    password,
    email,
  } = ctx.body
  const hashedPwd = hmac.update(password).digest('hex');

  const model = getModel(UserModel)
  const entity = model.create()
 
  try {
    const user = await model.save({
      ...entity,
      email,
      salt,
      password: hashedPwd,
      role: 1
    })
  
    return user
  } catch (error) {
   
    const er = error as IErrnoException
    if (er.code === "23505") {
      throw new HttpError(409, 'user already exists')
    }
    throw error
  }

  //return Auth.registerUser(hashedPwd, salt, email)
}

export default new Route({
  path: '/register',
  method: 'post',
  handler: register,
  validate: { body: bodySchema }
})