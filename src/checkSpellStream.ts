import fs from 'fs'
import YaSpellTransform from './classes/YaSpellTransform'
import { OUTPUT_DIR } from './config'
import ITask from './interfaces/ITask'

export default function checkSpellStream (task: ITask) : Promise<Boolean> {
  return new Promise((resolve, reject) => {
    const { path, id } = task

    fs.createReadStream(path, { encoding: 'utf8', highWaterMark: 2 * 1024 })
      .on('error', (error) => {
        reject(error)
      })
      .pipe(new YaSpellTransform())
      .on('error', (error) => {
        reject(error)
      })
      .pipe(fs
        .createWriteStream(`${OUTPUT_DIR}/${id}`, 'utf8')
      )
      .on('error', (error) => {
        reject(error)
      })
      .on('finish', () => {
        fs.unlink(path, (error) => {
          if (error) console.log(error.message)
        })
        resolve(true)
      })
  })
}