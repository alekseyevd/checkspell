export function table(name: string) {
  return function<T extends {new (...args: any[]): {}}> (Constructor: T) {
    return class extends Constructor {

      constructor(...args: any) {
        super(name)
      }
    }
  }
}

// export function table(name: string) {
//   return function (Constructor: any) {
//     Constructor.table = name
//   }
// }