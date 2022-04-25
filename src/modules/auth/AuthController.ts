import crypto from 'crypto'
import UserModel from "../../components/users/models/User";
import { IContext } from "../../lib/http/Context";
import { Body, Get, Post, route } from "../../lib/puppi/decorators";
import HttpError from "../../lib/http/HttpError";
import IErrnoException from "../../interfaces/IErrnoException";
import jwt from '../../lib/jwt';
import { JWTSECRET } from '../../config';
import SessionModel from '../../components/users/models/Session';

@route('/auth')
export default class AuthController {

  constructor(private model: UserModel, private sessionModel: SessionModel) {}

  @Post('/register')
  @Body({
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
  async register(ctx: IContext) {
    var salt = crypto.randomBytes(128).toString('base64')
    var hmac = crypto.createHmac('sha256', salt);
    const {
      password,
      email,
    } = ctx.body
    const hashedPwd = hmac.update(password).digest('hex');
  
    const model = this.model
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
  }

  @Post('/login')
  @Body({
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
  async login(ctx: IContext) {
    const app_token = ctx.headers['app_token'] as string
    if (!app_token) throw new HttpError(400, 'bad request (invalid app_token)')
  
    const { email, password } = ctx.body
    const user = await this.model.findByEmail(email)
  
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
    const session = await this.sessionModel.createSession(user.id, ip, user_agent, app_token)
  
    const refresh = jwt.sign({
      id: session.id,
      exp: session.expired_at
    }, JWTSECRET)
    return { token: access_token, refresh }
  }

  async refresh(ctx: IContext) {
    const app_token = ctx.headers.authorization?.split('Bearer ')[1]
    if (!app_token) throw new HttpError(401, 'Unauthorized')

    const ip = ctx.req.socket.remoteAddress
    const refresh = ctx.query.token

    try {
      const { id } = jwt.verify(refresh, JWTSECRET)
      if (!id) throw new HttpError(401, 'invalid token')

      const session = await this.sessionModel.updateSession(id, app_token, ip)
      if (!session) throw new HttpError(401, 'invalid app_token')

      const user = await this.model.findById(session.user_id)
      const access_token = jwt.sign({
        user: {
          id: user.id,
          email: user.email
        }
      }, JWTSECRET, 15 * 60000)

      const newRefresh = jwt.sign({
        id: session.id,
        exp: session.expired_at
      }, JWTSECRET)

      return { token: access_token, refresh: newRefresh }
    } catch (error) {
      if (error instanceof JWTError) throw new HttpError(401, 'invalid token')
      throw error
    }
  }
}