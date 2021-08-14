import Queue from "./Queue"

export default class JobQueue extends Queue {
  isBuisy: Boolean

  constructor(callback: (arg: any) => Promise<any>) {
    super() 
    this.isBuisy = false
    this.do = callback.bind(this)
  }

  async do(task: any): Promise<any> {}

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
        const task = this.pick()
        this.do(task)
          .then(() => this.setFree())
          .catch(() => this.setFree())
      }
    }, 1000)
  }
}