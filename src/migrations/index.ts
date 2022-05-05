import fs from 'fs'
import path from 'path'
import pg from 'pg'
import 'dotenv/config'
import { exit } from 'process'

function findFiles(_path: string) {
  let _files: Array<any> = []
  const files = fs.readdirSync(_path)
  files.forEach(file => {
    const stat = fs.statSync(path.join(_path, file))
    if (stat.isDirectory()) {
      const result = findFiles(path.join(_path, file))
      _files = _files.concat(result)
    } else {
      if (/\.sql$/.test(file)) {
        _files.push({
          name: file,
          path: path.join(_path, file)
        })
      }
    }
  })
  return _files.sort()
}

async function runMigrations() {
  
  const _pg = new pg.Pool()
  const files = findFiles(path.join(__dirname, '../modules'))
  const names = files.map(file => file.name)

  const client = await _pg.connect()

  
  const { rows } = await client.query(`SELECT * FROM migrations`)

  const _files = files.filter(file => !rows.some(row => row.filename === file.name))
  
  if (_files.length) {
    try {
      await client.query('BEGIN')
      for (const file of _files) {
        const data = fs.readFileSync(file.path).toString()
        
        await client.query(data)
        await client.query(`INSERT INTO migrations (filename) VALUES ($1)`, [file.name])
     }
  
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      console.log(e);
      exit(1)
    } finally {
      client.release()
    }
  }
  process.exit(0)
}

runMigrations()