import EventEmitter from "events"

type Message = {
  from: string,
  message: string,
  date?: Date
}

class Chat extends EventEmitter {
  private _users: Array<string> = []
  private _history: Array<Message>

  constructor() {
    super()
    this._users = []
    this._history = []
  }

  send(data: { from: string, message: string }) {
    this.emit('message', JSON.stringify({
      date: Date.now(),
      ...data, 
    }))
  }

  addUser(user) {
    this._users.push(user)
    return this
  }

  includes(user: string) {

  }
}