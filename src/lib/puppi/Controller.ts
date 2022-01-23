import { IContext } from "../http/Context";
import PuppyContext from "./interfaces";
import validator from './validate'
import crypto from 'crypto'

export default class Controller {
  private _method: string
  private _path: string
  private _validate: any
  private _options: any

  constructor(optons: any) {
    this._method = optons.method
    this._path = optons.path
    this._validate = optons.validate
    this._options = optons.options
  }

  private authenticate(ctx: IContext): any {
    const token = ctx.headers?.authorization?.split('Bearer ')[0]
    if (!token) return undefined

    return {
      user: undefined
    }
  }

  private authorize(user: any): boolean {
    return true
  }

  private async validate(context: IContext): Promise<Array<string>> {
    const bodySchema = this._validate.body
    const querySchema = this._validate.query
    const paramsSchema = this._validate.params
    const filesSchema = this._validate.files

    if (bodySchema) {
      const body = await context.body
      const { errors } = validator(bodySchema, body)
      if (errors) return errors
    }

    if (querySchema) {
      const query = context.query
      const { errors } = validator(querySchema, query)
      if (errors) return errors
    }

    if (paramsSchema) {
      const params = context.params
      const { errors } = validator(paramsSchema, params)
      if (errors) return errors
    }
    return []
  }

  private async render(ctx: PuppyContext) {
    console.log(ctx.headers);
    const { body, files } = await ctx.parseBody()
    let query = ctx.query

    //const  { files } = await ctx.saveToFile()
    return { body, files, query, }

  }

  private async handleRequest(context: IContext) {
    if (this._method && this._method !== context.method) throw new Error('method not allowed')

    const user = this.authenticate(context)
    //context.set('user', user)
  
    const hasAccess = this.authorize(user)
    if (!hasAccess) throw new Error('forbidden')
  
    // const errors = await this.validate(context)
    // if (errors.length) throw new Error(errors.join(', '))

    const ctx = this.addPropertyToContext(context, 'user', user)
  
    return this.render(ctx)
  }

  private addPropertyToContext(context: IContext, key: string, value: any): PuppyContext {
    Object.defineProperty(context, key, {
      get: function() {
        return value
      }
    })
    return context as PuppyContext
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