import { IContext } from '../http/Context'
import PuppyContext from './interfaces'
import validator from './validate'
import fs from 'fs'
import path from 'path'
import EventEmitter from 'events'
import IRoute from '../../interfaces/IRoute'
import App from './App'

export default class Controller implements IRoute {
  private _method: string
  private _path: string
  private _validate: any
  private _options: any
  private _use: { authenticate?: string, accessControl?: Array<string> }
  private _handler?: (ctx: IContext) => Promise<any>

  constructor(params: any) {
    this._method = params.method
    this._path = params.path
    this._validate = params.validate
    this._options = params.options
    this._use = params.use || {}
    this._handler = params.handler
  }

  // async _handler(ctx: IContext): Promise<any> {
  //   throw new Error('handler is not defuned')
  // }

  private async validate(ctx: IContext): Promise<Array<string>> {
    const bodySchema = this._validate?.body
    const querySchema = this._validate?.query
    const paramsSchema = this._validate?.params
    const headersSchema = this._validate?.headers
    
    if (bodySchema) {
      const { body } = await ctx.parseBody()
      const { errors } = bodySchema(body)
      //const { errors } = validator(bodySchema, body)
      if (errors) return errors
    }

    if (querySchema) {
      const query = ctx.query
      const { errors } = querySchema(query)
      // const { errors } = validator(querySchema, query)
      
      if (errors) return errors
    }

    if (paramsSchema) {
      const params = ctx.params
      const { errors } = paramsSchema(params)
      //const { errors } = validator(paramsSchema, params)
      if (errors) return errors
    }

    if (headersSchema) {
      const { errors } = headersSchema(ctx.headers)

      if (errors) return errors
    }
    return []
  }

  private async handleRequest(ctx: IContext) {
    
    if (!this._handler) throw new Error('handler is not defined')
    
    if (this._method && this._method !== ctx.method) throw new Error('method not allowed')

    const authenticate = App.authenticate.get(this._use?.authenticate || 'default')
    if (authenticate) {
      authenticate(ctx)
    }

    let authorized = false
    if (!this._use.accessControl) {
      const accessControl = App.authorize.get('default')
      authorized = accessControl ? accessControl(ctx) : true
    } else {
      for (const key of this._use.accessControl) {
        const accessControl = App.authorize.get(key)
        authorized = accessControl ? accessControl(ctx) : false
        if (authorized) break
      }
    }
    if (!authorized) throw new Error('unauthorized')

    const errors = await this.validate(ctx)
    if (errors.length) throw new Error(errors.join(', '))
  
    return this._handler(ctx)
  }

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