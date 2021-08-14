import fs from 'fs'
import YaSpellTransform from './classes/YaSpellTransform'
import ITask from './interfaces/ITask'

export default function checkSpellStream (task: ITask) : Promise<Boolean> {
  return new Promise((resolve, reject) => {
    let filepath = task.path
    let id = task.id

    fs.createReadStream(filepath, { encoding: 'utf8', highWaterMark: 2 * 1024 })
      .on('error', (error) => {
        reject(error)
      })
      .pipe(new YaSpellTransform())
      .on('error', (error) => {
        reject(error)
      })
      .pipe(fs
        .createWriteStream(`output/${id}`, 'utf8')
      )
      .on('error', (error) => {
        reject(error)
      })
      .on('finish', () => {
        fs.unlink(filepath, (error) => {
          if (error) console.log(error.message)
        })
        resolve(true)
      })
  })
}