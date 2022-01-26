import EventEmitter from "events"
import IRoute from "../../interfaces/IRoute"
import { IContext } from "../http/Context"
import Controller from "../puppi/Controller"

type Message = {
  from: string,
  message: string,
  date?: Date
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
    const type = ctx.body.type
    if (type === 'connect') {
      ctx.res.statusCode = 200
      ctx.res.setHeader('Connection', 'keep-alive')
      ctx.res.setHeader('Content-Type', 'text/event-stream')

      ctx.res.write(`data: token \n\n`)

      const onMessage = (message: string) => {
        ctx.res.write(`data: ${JSON.stringify(message)} \n\n`)
      }
      this.on('message', onMessage)

      ctx.res.on('close', () => {
       // emitter.emit('message', `${user} left chat`)
       this.emit('message', `user left chat`)
       this.removeListener('message', onMessage)
      })
    } else
    return 'oh'
  }

  send(data: { from: string, message: string }) {
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