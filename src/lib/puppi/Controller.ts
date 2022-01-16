import { IContext } from "../../interfaces/IRoute";
import PuppyContext from "./interfaces";
import validator from './validate'

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

  private authenticate(context: IContext): { user: any } {
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
    // let body = await ctx.body
    // let query = ctx.query
    // let files = await ctx.files
    const boundary = ctx.headers['content-type']?.split('=')[1]
    const buf = Buffer.from('----------------------------556455666302917302934070', 'utf-8')
    //console.log(JSON.stringify(buf));
    
    console.log('boundary', boundary);
    console.log('--------------');
    
    
    //return { body, query, files }
    return await new Promise((resolve, reject) => {
      const chunks: Array<Buffer> = [];
      let state = 'start'
      let lastItem: string = ''
      ctx.req.on('data', (chunk: Buffer) => {
        //chunks.push(chunk)
        console.log('chunkk');
        let rows = chunk.toString().split('\r\n')
        console.log(rows);
        
        rows[0] = lastItem + rows[0]
        for (let i = 0; i < rows.length - 1; i++) {
          if (state === 'start' && rows[i] === boundary) {
            state = 'boundary'
            continue
          }
          if (state === 'boundary') {
            const contentDisposition = rows[i].split('; ')
            if (contentDisposition.length === 3) {
              state = 'field name start'
              //to do parse field name
            } else if (contentDisposition.length === 2) {
              state = 'file name start'
              //todo parse file name
            } else {
              state = 'error'
            }
            continue
          }
          if (state === 'field name start' && rows[i] === '') {
            state = 'field value start'
            continue
          }
          if (state === 'field value start') {
            //to do save value
            state = 'part end'
            continue
          }
          if (state === 'file name start') {
            //to do save content type
            state = 'file content type saved'
            continue
          }
          if (state === 'file content type saved') {
            state = 'file start'
            // create write scream
            continue
          }
          if (state === 'file start') {
            if (rows[i] === boundary) {
              //file ended end write stream
              state = 'part end'
            } else if (rows[i] === (boundary + '--')) {
              state = 'ended'
            } else {
              //write stream
            }
            continue
          }

         


        }
        lastItem = rows[rows.length - 1]
      });
      ctx.req.on('end', () => {
        const data = Buffer.concat(chunks);
        //console.log(data.toString());
        //console.log(data.toString().split('\r\n'));
        
        resolve('pk')
      })
    })
  }

  private async handleRequest(context: IContext) {
    if (this._method && this._method !== context.method) throw new Error('method not allowed')

    const { user } = this.authenticate(context)
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