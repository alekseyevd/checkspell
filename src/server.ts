import fs from "fs"
import app from "./app"
import { OUTPUT_DIR, PORT, TEMP_DIR } from "./config"
import { queue } from "./Queue"

(async () => {
  try {
    if (!fs.existsSync(TEMP_DIR)) await fs.promises.mkdir(TEMP_DIR)
    if (!fs.existsSync(OUTPUT_DIR)) await fs.promises.mkdir(OUTPUT_DIR)

    queue.start()
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
    })
  } catch (error) {
    console.log(error.message)
    process.exit()
  }
})()