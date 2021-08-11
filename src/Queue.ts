export class Queue {
  first: any
  last: any
  size: number

  constructor() {
    this.first = null;
    this.last = null;
    this.size = 0
  }

  put(item: any) {
    const last = this.last;
    const element = { next: null, item };
    if (last) {
      last.next = element;
      this.last = element;
    } else {
      this.first = element;
      this.last = element;
    }
    this.size++
  }

  pick() {
    const element = this.first;
    if (!element) return null;
    if (this.last === element) {
      this.first = null;
      this.last = null;
    } else {
      this.first = element.next;
    }
    this.size--
    return element.item;
  }
}