import crypto from 'crypto'
import UserModel from "../../components/users/models/User";
import { IContext } from "../../lib/http/Context";
import { Get, Post, route } from "../../lib/puppi/decorators";
import HttpError from "../../lib/http/HttpError";
import IErrnoException from "../../interfaces/IErrnoException";
import jwt from '../../lib/jwt';
import { JWTSECRET } from '../../config';
import SessionModel from '../../components/users/models/Session';

@route('/auth')
export default class AuthController {

  constructor(private model: UserModel, private sessionModel: SessionModel) {}

  @Post('/register')
  async register(ctx: IContext) {
    var salt = crypto.randomBytes(128).toString('base64')
    var hmac = crypto.createHmac('sha256', salt);
    const {
      password,
      email,
    } = (await ctx.parseBody()).body
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
}