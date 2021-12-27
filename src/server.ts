import fs from 'fs'
import { OUTPUT_DIR, PORT, TEMP_DIR } from "./config"
import { queue } from "./Queue"
import HttpServer from './lib/http'
import routes from "./routes"
import path from 'path'
import FileServer from './lib/http/static'

const server = new HttpServer({
  routes,
  port: PORT,
  static: new FileServer({
    dir: path.join(__dirname, './public'),
    alias: 'static'
  })
});

(async () => {
  try {
    if (!fs.existsSync(TEMP_DIR)) await fs.promises.mkdir(TEMP_DIR)
    if (!fs.existsSync(OUTPUT_DIR)) await fs.promises.mkdir(OUTPUT_DIR)

    queue.start()
    server.listen(() => {
      console.log(`Server listening on port ${PORT}`)
    })
  } catch (error) {
    console.log(error)
    process.exit()
  }
})()