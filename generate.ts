//process.stdin.resume()
import fs from 'fs'
import path from 'path'

console.log('Enter the data to be displayed ');
process.stdin.on('data', function(data) { 
  process.stdout.write(data)
  console.log(data.toString());
  const name = data.toString().replace('\r\n', '')
  fs.existsSync(path.join(__dirname, './src/modules', name, 'migrations'))
  
  process.exit(0)
 })