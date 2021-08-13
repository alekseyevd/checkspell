import { db } from './db'
import { JobQueue } from './classes/JobQueue'
import checkSpellStream from './checkSpellStream'

export const queue = new JobQueue(async (item) => {
  try {
    await checkSpellStream(item)
    db.update({ id: item.id, status: 'done'})
  } catch (error) {
    db.update({ id: item.id, status: 'error', message: error.message})
  }
})
