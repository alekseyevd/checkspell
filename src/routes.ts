import IRoute from './interfaces/IRoute'
import Controller from './lib/puppi/Controller'
import { IContext } from './lib/http/Context'
import fs from 'fs'
import path from 'path'
import stream from 'stream'
import crypto from 'crypto'
import zlib from 'zlib'
import { EventEmitter } from 'events'
import Chat from './lib/chat'
import { Schema } from './lib/puppi/validate'

const iv = Buffer.from('0a9b8d1da137092a6c2f210227022396', 'hex')
const emitter = new EventEmitter()

const routes: Array<IRoute> = [
  // { method: 'get', path: '/', action: mainRoute},
  // // { method: 'post', path: '/api/v1/', action: fileuploadRoute },
  // // { method: 'get', path: '/output/', action: outputRoute },
  // { 
  //   method: 'post',
  //   path: '/test/{id}',
  //   action: testRoute,
  //   options: {
  //     validate: {
  //       query: 'nn'
  //     }
  //   }
  // }
  // new Controller({
  //   path: '/register',
  //   method: 'post',
  //   handler: async (ctx: IContext) => {
  //     const password = ctx.body.password
  //     const name = ctx.body.name.toLowerCase()
  //     if (fs.existsSync(path.join('storage', name))) throw new Error(`User ${name} is already exist`)
    
  //     await fs.promises.mkdir(path.join('storage', name))
  //     await fs.promises.writeFile(path.join('storage', name, '.psw'), password)
  //     return { result: true }
  //   },
  //   validate: {
  //     body: {
  //       type: "object",
  //       properties: {
  //         name: {
  //           type: 'string',
  //           format: 'email',
  //         },
  //         password: {
  //           type: 'string',
  //           minLength: 5
  //         },
  //       },
  //       required: ['name', 'password'],
  //       additionalProperties: false
  //     }
  //   }
  // }),
  // new Controller({
  //   path: '/storage',
  //   method: 'put',
  //   auth: true,
  //   handler: async (ctx: IContext) => {
  //     const secret = ctx.headers['x-secret']
  //     const filename = ctx.headers['file-name']
  //     if (!secret) throw new Error('request headers do not contain x-secret value')
  //     return await ctx.saveToFile({
  //       dir: ctx.get('user'),
  //       filename,
  //       secret 
  //     }).then(ctx => ctx.files)
  //   },
  //   options: {
  //     fileHandler: async (file: stream, params: any) => {
  //       return new Promise((resolve, reject) => {
  //         const encrypt = crypto.createCipheriv('aes-256-ctr', params.secret, iv);
      
  //         const filename = `${Date.now()}_${params.filename}.gz`
  //         const pathname = path.join(__dirname, '../storage', params.dir, filename) 
  //         const stream = fs.createWriteStream(pathname)
  //         const gz = zlib.createGzip();
  //         file
  //           .pipe(encrypt)
  //           .pipe(gz)
  //           .pipe(stream)
  //           .on('finish', () => resolve({
  //             filename,
  //             pathname
  //           }))
  //           .on('error', (error: Error) => reject(error))
  //       })
  //     }
  //   },
  // }),
  // new Controller({
  //   path: '/storage/{id}',
  //   method: 'get',
  //   auth: true,
  //   handler: async (ctx: IContext) => {
  //     const id = ctx.params.id
  //     const user = ctx.get('user')
  //     const secret = ctx.headers['x-secret']?.toString()
  //     if (!secret) throw new Error('request headers do not contain x-secret')
      
  //     const pathname = path.join(__dirname, '../storage', user)
  //     const filename = fs.readdirSync(pathname).filter(f => f.startsWith(`${id}_`))[0];

  //     const gz = zlib.createUnzip()
  //     const encrypt = crypto.createDecipheriv('aes-256-ctr', secret, iv);
  
  //     const original = filename.replace(`${id}_`, '').slice(0, -3)
  //     ctx.res.setHeader('Content-Disposition', `attachment; filename=${original}`)
  //     const stream = fs.createReadStream(path.join(pathname, filename))
  //       .on('error', () => {
  //         ctx.res.writeHead(404)
  //       })
  //       .pipe(gz)
  //       .pipe(encrypt)
  //     return stream

  //   }
  // }),
  // new Controller({
  //   path: '/storage/{id}',
  //   method: 'delete',
  //   auth: true,
  //   handler: async (ctx: IContext) => {
  //     const id = ctx.params.id
  //     const user = ctx.get('user')
      
  //     const pathname = path.join(__dirname, '../storage', user)
  //     const filename = fs.readdirSync(pathname).filter(f => f.startsWith(`${id}_`))[0];
  //     if (!filename) throw new Error('file not found')
  //     await fs.promises.unlink(path.join(pathname, filename))
  //     return { result: 'done' }
  //   }
  // }),
  new Controller({
    path: '/test/{id}',
    method: 'post',
    handler: async (ctx: IContext) => {
      return ctx.body
    },
    validate: {
      body: Schema({
        type: 'object',
        properties: {
          foo: {
            type: 'string',
            format: 'email'
          },
          bar: {
            type: 'object',
            properties: {
              foo: {
                type: 'number',
                minimum: 5
              }
            }
          }
        },
        required: ['foo', 'bar'],
        additionalProperties: false
      })
    }
  }),
  // new Controller({
  //   path: '/connect',
  //   method: 'get',
  //   handler: async (ctx: IContext) => {
  //     //const user = ctx.body.user
  //     ctx.res.statusCode = 200
  //     ctx.res.setHeader('Connection', 'keep-alive')
  //     ctx.res.setHeader('Content-Type', 'text/event-stream')

  //     ctx.res.write(`data: token \n\n`)

  //     emitter.on('message', (message) => {
  //       ctx.res.write(`data: ${JSON.stringify(message)} \n\n`)
  //     })

  //     ctx.res.on('close', () => {
  //      // emitter.emit('message', `${user} left chat`)
  //      emitter.emit('message', `user left chat`)
  //     })
  //   },
  //   validate: {
  //     body: {
  //       type: 'object',
  //       properties: {
  //         user: {
  //           type: 'string',
  //           minLength: 2,
  //           maxLength: 20
  //         },
  //         chat_id: {
  //           type: "integer"
  //         },
  //       },
  //       required: ['user', 'chat_id'],
  //       additionalProperties: false,
  //     }
  //   }
  // }),
  // new Controller({
  //   path: '/message',
  //   method: 'post',
  //   handler: async (ctx: IContext) => {
  //     const user = ctx.body.user

  //     emitter.emit('newMessage', 'test message')
  //     ctx.res.statusCode = 200
  //     return { status: 'done' }
  //   },
  //   use: {
  //     authenticate: 'default',
  //     accessControl: ['admin', 'user'],
  //   }
  // }),
  // new Chat({
  //   path: '/chat',
  //   method: 'get',
  //   validate: {
  //     query: {
  //       type: 'object',
  //       properties: {
  //         type: {
  //           type: 'string'
  //         },
  //         name: {
  //           type: 'string'
  //         },
  //         token: {
  //           type: 'string',
  //         },
  //         message: {
  //           type: 'string'
  //         }
  //       },
  //       required: ['type'],
  //       additionalProperties: false,
  //     }
  //   }
  // })
]

export default routes


