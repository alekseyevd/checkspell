import Module from "../../lib/puppi/Module";
import { module } from "../../lib/puppi/decorators";
import AuthController from "./AuthController";
import fs from 'fs'
import path from 'path'

function runMigrations(_path: string) {
  const files: Array<any> = []

  fs.readdir(_path, (err, files) => {
    if(err) throw err;

    const _files: Array<any> = []

    for (let file of files){
      fs.stat(path.join(_path, file), (errStat, status) => {
        if(errStat) throw errStat;

        if(status.isDirectory()){
            //console.log('Папка: ' + file);
            runMigrations(path.join(_path, file)); // продолжаем рекурсию
        }else{
            //console.log('Файл: ' + file);
            if (/\.sql$/.test(file)) {
              _files.push(file)
            }
        }
      });
    }

  });
   
   
}

@module({
  controllers: [
    AuthController
  ]
})
export class AuthModule extends Module {
  async prepare(): Promise<void> {
    runMigrations(path.join(__dirname, './migrations/'))
  }
}