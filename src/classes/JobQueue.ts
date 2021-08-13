import { Queue } from "./Queue"

export class JobQueue extends Queue {
  isBuisy: Boolean

  constructor(callback: (arg: any) => Promise<any>) {
    super() 
    this.isBuisy = false
    this.do = callback.bind(this)
  }

  async do(item: any): Promise<any> {}

  setBuisy() {
    this.isBuisy = true
  }

  setFree() {
    this.isBuisy = false
  }

  start() {
    setInterval(async () => {
      if (this.isBuisy) return

      if (this.size > 0) {
        this.setBuisy()
        const item = this.pick()
        this.do(item)
          .then(() => this.setFree())
          .catch(() => this.setFree())
      }
    }, 1000)
  }
}