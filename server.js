'use strict'

const fs = require('fs');
const net = require('net');

const _user = 'dbuser'
const _password = 'secret password'

class EmojiDB extends Map {
  constructor() {
    super()
    this._waitForInsertionItem = ''
    this._inserted = 0
    //to do read fs
  }

  query(str) {
    const emoji = str[0]
    const query = str.slice(1)
    switch (emoji) {
      case '💉':
        return this.insert(query.slice(1))

      case '🍆':
        const id = +query.slice(1)
        if (isNaN(id)) throw new Error('🌵invalid query')
        return this.findById(id)
    
      case '📖':
        const range = query.split('-')
        if (range.length !== 2) throw new Error('🌵invalid query')

        const from = +range[0]
        const to = + range[1]
        if (isNaN(from) || isNaN(to) || from >= to || from <= 0) throw new Error('🌵invalid query')

        return db.findByRange(from, to)

      default:
        throw new Error('🌵invalid query')
    }
  }

  insert(value) {
    const id = this.size + 1
    this.set(id, value)
    fs.writeFile('emoji.db', JSON.stringify(Object.fromEntries(this)))
    return id
    //to do write fs
  }

  bulkInsert(data) {
    
    const items = data.split('💩')
    if (items.length === 0)  {
      this._waitForInsertionItem += items[0]
      return
    }
    for (let i = 0; i < items.length; i++) {
      if (i === 0) {
        const id = this.size + 1
        this.set(id, this._waitForInsertionItem + items[i])
      } else {
        const id = this.size + 1
        this.set(id, items[i])
      }
      this._inserted++
    }
    this._waitForInsertionItem = items.at(-1)
  }

  endBulk() {
    this.insert(this._waitForInsertionItem)
    const result = ++this._inserted
    this._inserted = 0
    fs.writeFile('emoji.db', JSON.stringify(Object.fromEntries(this)))
    return result
  }

  findById(id) {
    return this.get(id)
  }

  findByRange(from, to) {
    const result = []
    for (let i = from; i <= to; i++) {
      const item = this.get(i)
      if (item) result.push(`${id}💲item`)
    }
    return result.join('\r\n')
  }
}

const obj = fs.readFileSync('emoji.db')
const db = new EmojiDB(Object.entries(JSON.parse(obj)))

const connection = (socket) => {
  socket.setTimeout(3000);

  socket.write('⁉')

  let state = 'AUTH'
  let query = []
  let credentials_input = ''

  socket.on('data', (buffer) => {
    const data = buffer.toString()
    if (state === 'AUTH') {
      credentials_input += data

      if (!data.includes('💩')) return

      const [ user, password ] = credentials_input.split('🚀')
      if (user !== _user || password !== _password) {
        socket.write('🌵invalid credentials')
        socket.end()
      } else {
        socket.write('✅')
        state = 'AUTHORIZED'
      }
      return
    }

    if (state === 'AUTHORIZED') {
      if (data.startsWith('🌀')) {
        state = 'BULK_QUERY'
      } else {
        state = 'QUERY'
      }
    }

    if (state === 'BULK_QUERY') {
      db.bulkInsert(data)
    }

    if (state === 'QUERY') {
      query.push(data)
    }
  })

  socket.on('end', () => {
    try {
      const result = state === 'BULK_QUERY'
        ? db.endBulk()
        : db.query(query.join())
      socket.write(result)
      socket.end()
    } catch (error) {
      socket.write(error.message)
      socket.end()
    }
  })

  socket.on('drain', () => {
    console.log('Event: 🤷');
  });

  socket.on('error', (err) => {
    console.log(err);
  });

  socket.on('timeout', () => {
    console.log('Event: ⌛')
    socket.end();
  });

};

const server = net.createServer({allowHalfOpen:true});
server.on('connection', connection);
server.listen(2000);