import EventEmitter from "events"
import IRoute from "../../interfaces/IRoute"
import { IContext } from "../http/Context"
import Controller from "../puppi/Controller"

type Message = {
  date: number,
  from: string,
  data: string,
}

export default class Chat extends Controller {
  private _users: Map<string, any>
  private _history: Array<Message>


  constructor(params: any) {
    super(params)
    this._users =new Map()
    this._history = []

  }

  async _handler(ctx: IContext) {
    const type = ctx.query.type
    
    if (type === 'connect') {
      const onMessage = (message: string) => {
        ctx.res.write(`${message} \n\n`)
      }
      this.on('message', onMessage)

      const name = ctx.query.name
      if (!name) throw new Error('Invalid name value')
      const token = Buffer.from(name + Date.now()).toString('base64')

      ctx.res.statusCode = 200
      ctx.res.setHeader('Connection', 'keep-alive')
      ctx.res.setHeader('Content-Type', 'text/event-stream')

      //ctx.res.write(`data: token \n\n`)
      this._users.set(token, name)
      ctx.res.write(`${JSON.stringify({ type: 'connect', token})} \n\n`)
      
      ctx.res.on('close', () => {
        // emitter.emit('message', `${user} left chat`)
        // this.emit('message', `user left chat`)
        this.removeListener('message', onMessage)
        this._users.delete(token)
        //this.send({ type: 'disconnect', data: `${name} user left chat` })
        
      })
    } else if (type === 'sendMessage') {
      const token = ctx.query.token
      if (!this._users.has(token)) throw new Error('Invalid token')

      const message = { 
        type: 'message',
        date: Date.now(),
        from: this._users.get(token),
        data: ctx.query.message
      }

      // this.emit('message', 'test message')
      this._history.push(message)
      //this.send(message)
      this.emit('message', JSON.stringify(message))

      ctx.res.statusCode = 200
      return { status: 'done' }
    } else if (type === 'getUsers') {
      const token = ctx.query.token
      if (!this._users.has(token)) throw new Error('Invalid token')
      const users = this._users.keys()

      return { 
        status: 'done',
        data: Array.from(this._users, ([name, value]) => (value))
      }
      // this.send({
      //   type: 'message',
      //   data: Array.from(this._users, ([name, value]) => (value))
      // })
    } else if (type === 'getHistory') {
      const token = ctx.query.token
      if (!this._users.has(token)) throw new Error('Invalid token')
      return {
        status: 'done',
        data: this._history
      }
    } 

  }

  send(data: { type: string, data: any }) {
    this.emit('message', JSON.stringify({
      date: Date.now(),
      ...data, 
    }))
  }

  // addUser(user) {
  //   this._users.push(user)
  //   return this
  // }

  hasUser(token: string) {
    return this._users.has(token)
  }
}