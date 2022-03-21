import fs from 'fs'
import { OUTPUT_DIR, PORT, TEMP_DIR } from './config'
import { queue } from './Queue'
import HttpServer from './lib/http'
import routes from './routes'
import path from 'path'
import { pool } from './db'

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