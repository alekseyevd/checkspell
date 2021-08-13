type Record = {
  id: string,
  [key: string]: any
}

class Db {
  [key: string]: any

  add (item: Record) {
    this[item.id] = item
  }
  update (item: Record) {
    if (this.hasOwnProperty(item.id)) {
      this[item.id] = { ...this[item.id], ...item }
    }
  }
  findById(id: string): Record | undefined {
    return this[id] 
  }
}

export const db = new Db()