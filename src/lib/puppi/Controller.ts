import { IContext } from '../http/Context'
import PuppyContext from './interfaces'
import validator from './validate'
import fs from 'fs'
import path from 'path'
import EventEmitter from 'events'
import IRoute from '../../interfaces/IRoute'

export default class Controller extends EventEmitter implements IRoute {
  private _method: string
  private _path: string
  private _validate: any
  private _options: any
  private _auth: boolean
  //private _handler?: (ctx: IContext) => Promise<any>

  constructor(params: any) {
    super()
    this._method = params.method
    this._path = params.path
    this._validate = params.validate
    this._auth = params.auth || false
    this._options = params.options
    if (params.handler) {
      this._handler = params.handler
    }
  }

  async _handler(ctx: IContext): Promise<any> {
    throw new Error('handler is not defuned')
  }

  private authenticate(ctx: IContext): any {
    const token = ctx.headers?.authorization?.split('Basic ')[1]
    
    if (!token) return undefined

    const [ name, password ] = Buffer.from(token, 'base64').toString().split(':')
    try {
      const psw = fs.readFileSync(path.join(__dirname, '../../../storage', name, '.psw')).toString()

      if (psw !== password) return undefined
      
      return name
    } catch (error) {
      console.log(error);
      
      return undefined
    }
    
  }

  private authorize(user: any): boolean {
    return !!user
  }

  private async validate(ctx: IContext): Promise<Array<string>> {
    const bodySchema = this._validate?.body
    const querySchema = this._validate?.query
    const paramsSchema = this._validate?.params
    const filesSchema = this._validate?.files
    
    

    if (bodySchema) {
      const { body } = await ctx.parseBody()
      console.log(bodySchema);
      
      const { errors } = validator(bodySchema, body)
      if (errors) return errors
    }

    if (querySchema) {
      const query = ctx.query
      const { errors } = validator(querySchema, query)
      if (errors) return errors
    }

    if (paramsSchema) {
      const params = ctx.params
      const { errors } = validator(paramsSchema, params)
      if (errors) return errors
    }
    return []
  }

  private async handleRequest(ctx: IContext) {
    if (!this._handler) throw new Error('handler is not defined')
    
    if (this._method && this._method !== ctx.method) throw new Error('method not allowed')

    let user
    if (this._auth) {
      user = this.authenticate(ctx)
      ctx.set('user', user)
      
      const hasAccess = this.authorize(user)
      if (!hasAccess) throw new Error('forbidden')
    }

    const errors = await this.validate(ctx)
    if (errors.length) throw new Error(errors.join(', '))

    //const context = this.addPropertyToContext(ctx, 'user', user)
  
    return this._handler(ctx)
  }

  // private addPropertyToContext(context: IContext, key: string, value: any): PuppyContext {
  //   Object.defineProperty(context, key, {
  //     get: function() {
  //       return value
  //     }
  //   })
  //   return context as PuppyContext
  // }

  get method() {
    return this._method
  }

  get path() {
    return this._path
  }

  get options() {
    return this._options
  }

  get action() {
    return this.handleRequest.bind(this)
  }
}