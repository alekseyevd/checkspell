import { IContext } from "../../interfaces/IRoute";
import PuppyContext from "./interfaces";
import validator from './validate'

export default class Controller {
  private _method: string
  private _path: string
  private _validate: any

  constructor(optons: any) {
    this._method = optons.method
    this._path = optons.path
    this._validate = optons.validate
  }

  private authenticate(context: IContext): { user: any } {
    return {
      user: undefined
    }
  }

  private authorize(user: any): boolean {
    return true
  }

  private async validate(context: IContext): Promise<Array<string>> {
    const schema = this._validate.body
    
    
    if (schema) {
      const body = await context.body

      const result = validator(schema, body.fields)
      console.log(result);
      
      if (!result) return ['errors']
      return []
    }
    return []
  }

  private async render(ctx: PuppyContext) {
    let user = await ctx.body
    console.log(user);
    
    return { hgj: user || null }
  }

  private async handleRequest(context: IContext) {
    if (this._method && this._method !== context.method) throw new Error('method not allowed')

    const { user } = this.authenticate(context)
    //context.set('user', user)
  
    const hasAccess = this.authorize(user)
    if (!hasAccess) throw new Error('forbidden')
  
    const errors = await this.validate(context)
    if (errors.length) throw new Error('validation error')

    const ctx = this.addPropertyToContext(context, 'user', user)
  
    return this.render(ctx)
  }

  private addPropertyToContext(context: IContext, key: string, value: any) {
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

  get action() {
    return this.handleRequest.bind(this)
  }
}