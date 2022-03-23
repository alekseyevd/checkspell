import fs from 'fs'
import { JWTSECRET, OUTPUT_DIR, PORT, TEMP_DIR } from './config'
import { queue } from './Queue'
import HttpServer from './lib/http'
import routes from './routes'
import path from 'path'
import { pool } from './db'
import App from './lib/puppi/App'
import { IContext } from './lib/http/Context'
import jwt from './lib/jwt'

App.authenticate.set('default', (ctx: IContext) => {
  ctx.set('user', 'anonymous')
})
App.authenticate.set('jwt', (ctx: IContext) => {
  const token = ctx.headers.authorization?.split('Bearer ')[1]
  if (!token) throw new Error('Unauthorized')

  const { user } = jwt.verify(token, JWTSECRET)
  if (!user) throw new Error('Invalid token')
  ctx.set('user', user)
})

const server = new HttpServer({
  routes,
  port: PORT,
  static: {
    dir: path.join(__dirname, './public'),
  },
});

(async () => {
  try {
    if (!fs.existsSync(TEMP_DIR)) await fs.promises.mkdir(TEMP_DIR)
    if (!fs.existsSync('storage')) await fs.promises.mkdir('storage')
    if (!fs.existsSync(OUTPUT_DIR)) await fs.promises.mkdir(OUTPUT_DIR)

    queue.start()
    await pool.connect()
    server.listen(() => {
      console.log(`Server listening on port ${PORT}`)
    })
  } catch (error) {
    console.log(error)
    process.exit()
  }
})()