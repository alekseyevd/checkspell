import fs from 'fs'
import path from 'path'

function findFiles(_path: string) {
  let _files: Array<any> = []
  const files = fs.readdirSync(_path)
  files.forEach(file => {
    const stat = fs.statSync(path.join(_path, file))
    if (stat.isDirectory()) {
      const result = findFiles(path.join(_path, file))
      _files = _files.concat(result)
    } else {
      if (/\.up.sql$/.test(file)) {
        _files.push(file)
      }
    }
  })
  return _files.sort()
}

function runMigrations() {
  const pathName = path.join(__dirname, 'up')
  return fs.readdirSync(pathName).filter(file => {
    return fs.statSync(path.join(pathName, file)).isFile() && /\.sql$/.test(file)
  }).sort().map(file => path.join(pathName, file))
}

const files = findFiles(path.join(__dirname, '../modules'))
console.log(files);
