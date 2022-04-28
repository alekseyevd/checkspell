import { IContext } from "../../lib/http/Context";
import { Body, Get, Post, QueryParams, route } from "../../lib/puppi/decorators";
import HttpError from "../../lib/http/HttpError";
import AuthService from './services/AuthService';

@route('/auth')
export default class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) {}

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
  register(ctx: IContext) {
    const { email, password } = ctx.query
    return this.authService.register(email, password)
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
  login(ctx: IContext) {
    const app_token = ctx.headers['app_token'] as string
    if (!app_token) throw new HttpError(400, 'bad request (invalid app_token)')

    const { email, password } = ctx.query
    const ip = ctx.req.socket.remoteAddress || ''
    const user_agent = ctx.headers['user-agent'] || ''

    return this.authService.login(email, password, app_token, ip, user_agent)
  }

  @Get('/refresh')
  @QueryParams({
    type: 'object',
    properties: {
      token: 'string'
    },
    required: ['token']
  })
  async refresh(ctx: IContext) {
    const app_token = ctx.headers.authorization?.split('Bearer ')[1]
    if (!app_token) throw new HttpError(401, 'Unauthorized')

    const ip = ctx.req.socket.remoteAddress || ''
    const refresh = ctx.query.token

    return this.authService.refresh(app_token, ip, refresh)
  }

  @Post('/logout')
  @QueryParams({
    type: 'object',
    properties: {
      token: 'string'
    },
    required: ['token']
  })
  logout(ctx: IContext) {
    const token = ctx.body.token
    return this.authService.logout(token)
  }
}