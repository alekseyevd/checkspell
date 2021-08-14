import { db } from './db'
import JobQueue from './classes/JobQueue'
import checkSpellStream from './checkSpellStream'
import ITask from './interfaces/ITask'

export const queue = new JobQueue(async (task: ITask) => {
  try {
    await checkSpellStream(task)
    db.update({ id: task.id, status: 'done'})
  } catch (error) {
    db.update({ id: task.id, status: 'error', message: error.message})
  }
})
