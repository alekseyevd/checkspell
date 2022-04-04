import crypto from 'crypto'
import app from "../../../app";
import { JWTSECRET } from "../../../config";
import { getModel } from '../../../lib/database';
import { IContext } from "../../../lib/http/Context";
import HttpError from '../../../lib/http/HttpError';
import jwt from "../../../lib/jwt";
import Route from '../../../lib/puppi/Route';
import { Schema } from '../../../lib/validation/validate';
import Auth from '../models/Auth';
import UserModel from '../models/User';

const body = Schema({
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email'
    },
    password: {
      type: 'string'
    }
  },
  required: ['login', 'password']
})

async function login (ctx: IContext) {
  const app_token = ctx.headers.authorization
  if (!app_token) throw new HttpError(400, 'bad request')

  const { email, password } = ctx.body
  const user = await getModel(UserModel).findByEmail(email)

  if (!user) throw new HttpError(401, 'invalid credentials')

  var hmac = crypto.createHmac('sha256', user.salt);
  const hashedPwd = hmac.update(password).digest('hex');
  if (hashedPwd !== user.password) throw new HttpError(401, 'invalid credentials')

  const access_token = jwt.sign({ 
    user: {
      id: user.id,
      email,
      role: user.role 
    }
  }, JWTSECRET, 15 * 60000)

  const ip = ctx.req.socket.remoteAddress || ''
  const user_agent = ctx.headers['user-agent'] || ''
  const session = await Auth.createSession(user.id, ip, user_agent, app_token)
  
  const refresh = jwt.sign({
    id: session.id,
    exp: session.expired_at
  }, JWTSECRET)
  return { token: access_token, refresh }
}

export default new Route({
  path: '/login',
  method: 'post',
  handler: login,
  validate: {
    body
  }
})
