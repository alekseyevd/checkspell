import Module from "../../lib/puppi/Module";
import { module } from "../../lib/puppi/decorators";
import AuthController from "./AuthController";
import fs from 'fs'
import path from 'path'

function runMigrations(_path: string) {
  let _files: Array<any> = []
  const files = fs.readdirSync(_path)
  files.forEach(file => {
    const stat = fs.statSync(path.join(_path, file))
    if (stat.isDirectory()) {
      const result = runMigrations(path.join(_path, file))
      _files = _files.concat(result)
    } else {
      if (/\.up.sql$/.test(file)) {
        _files.push(file)
      }
    }
  })
  return _files.sort()
}

@module({
  controllers: [
    AuthController
  ]
})
export class AuthModule extends Module {
  async prepare(): Promise<void> {
    const f = runMigrations(path.join(__dirname, './migrations/'))
    console.log(f);
    
  }
}