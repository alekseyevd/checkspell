import crypto from 'crypto'
import app from "../../../app";
import { JWTSECRET } from "../../../config";
import { IContext } from "../../../lib/http/Context";
import HttpError from '../../../lib/http/HttpError';
import jwt from "../../../lib/jwt";
import Route from '../../../lib/puppi/Route';
import { Schema } from '../../../lib/validation/validate';
import Auth from '../models/Auth';

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
  const {
    email, password
  } = ctx.body
  const user = await Auth.findUserByEmail(email)
  if (!user) throw new Error('invalid credentials')

  var hmac = crypto.createHmac('sha256', user.salt);
  const hashedPwd = hmac.update(password).digest('hex');
  if (hashedPwd !== user.password) throw new HttpError(401, 'invalid credentials')

  const token = jwt.sign({ 
    user: {
      id: user.id,
      email 
    }
  }, JWTSECRET, 15 * 60000)

  const ip = ctx.req.socket.remoteAddress
  const session = await Auth.createSession(token, user.id, ip)

  const refresh = jwt.sign({
    id: session.id,
    exp: session.expired_at
  }, JWTSECRET)
  return { token, refresh }
}

export default new Route({
  path: '/login',
  method: 'post',
  handler: login,
  validate: {
    body
  }
})
