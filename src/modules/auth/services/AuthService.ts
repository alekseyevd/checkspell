import crypto from 'crypto'
import SessionModel from "../models/Session";
import UserModel from "../models/User";
import { JWTSECRET } from '../../../config';
import IErrnoException from '../../../interfaces/IErrnoException';
import HttpError from '../../../lib/http/HttpError';
import jwt, { JWTError } from '../../../lib/jwt';
import { injectable } from '../../../lib/puppi/decorators';

@injectable
export default class AuthService {
  constructor(
    private userModel: UserModel,
    private sessionModel: SessionModel
  ) {}

  async register(email: string, password: string) {
    var salt = crypto.randomBytes(128).toString('base64')
    var hmac = crypto.createHmac('sha256', salt);

    const hashedPwd = hmac.update(password).digest('hex');
  
    const model = this.userModel
    const entity = model.create()
   
    try {
      const user = await this.userModel.save({
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

  async login (email: string, password: string, app_token: string, ip: string, user_agent: string) {
    const user = await this.userModel.findByEmail(email)
  
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
  
    const session = await this.sessionModel.createSession(user.id, ip, user_agent, app_token)
  
    const refresh = jwt.sign({
      id: session.id,
      exp: session.expired_at
    }, JWTSECRET)
    return { token: access_token, refresh }
  }

  async logout(token: string) {
    const { id } = jwt.verify(token, JWTSECRET)
    if (!id) throw new HttpError(401, 'invalid token')
  
    const session = await this.sessionModel.deleteSession(id)
    if (!session) throw new HttpError(401, 'invalid token')
  
    return 'ok'
  }

  async refresh(app_token: string, ip: string, refresh: string) {
    try {
      const { id } = jwt.verify(refresh, JWTSECRET)
      if (!id) throw new HttpError(401, 'invalid token')

      const session = await this.sessionModel.updateSession(id, app_token, ip)
      if (!session) throw new HttpError(401, 'invalid app_token')

      const user = await this.userModel.findById(session.user_id)
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