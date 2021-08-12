import { createServer, IncomingMessage, ServerResponse } from 'http'
import { IErrnoException } from './interfaces/IErrnoException'
import { IRouting } from './interfaces/IRouting'
import { URL } from "url"
import path  from 'path'
import fs, { unlink } from 'fs'
import formidable from 'formidable'
import { Queue } from './Queue'
import { Transform } from 'stream'
import https from 'https'
 
const port = 5000
const queue = new Queue()



const routing: IRouting = {
  '/': (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="/api/v1/fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  },
  '/queue': (req, res) => {
    res.end(JSON.stringify(queue))
  },
  '/api/v1/fileupload': (req, res) => {
    const filePath = path.join(__dirname, `../temp`);

    var form = new formidable.IncomingForm({ uploadDir: filePath });
    form.parse(req, function (err, fields, files) {
      //res.write('File uploaded');
      queue.put(files.filetoupload)
      res.end(JSON.stringify(queue, null, 2))
    });
    
  }
}


const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  
  const url = new URL(req.url || '/', `http://${req.headers.host}` )
  
  const f = routing[url.pathname]
  if (!f) {
    res.end('not found')
    return
  } 
  
  f(req, res)
});
 
server.listen(port, () => {
  let isBuisy: Boolean = false
  setInterval(() => {   
    if (isBuisy) return

    if (queue.size > 0) {
      isBuisy = true
      checkSpell(queue).then(() => {
        let item = queue.pick()
        //unlink 
        //console.log(item);
        unlink(item.path, (err) => {
          if (err) throw new Error('file was not deleted') 
          console.log('file deleted');
          
        })
        isBuisy = false
      })
      .catch(error => {
        console.log(error);
      })
    }
    
    
  }, 1000)
  console.log(`Server listening on port ${port}`)
})

server.on('error', (error: IErrnoException) => {
  if (error.code === 'EACCES') {
    console.log(`No access to port: ${port}`);
  }
});


server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
})

class CheckSpellStream extends Transform {
  _transform(chunk: String, encoding: String, cb: Function) {
      //asyncFunction(chunk, cb)
      // setTimeout(() => {
      //   this.push(chunk.toString().toUpperCase())
      //   cb()
      // }, 15000)
      //console.log(chunk.toString());
      
      const options = {
        hostname: 'speller.yandex.net',
        path: encodeURI(`/services/spellservice.json/checkText?text=${chunk.toString()}`),
        method: 'GET'
      }
      const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)
        let all_chunks: Array<Buffer> = [];
        res.on('data', (chunk: any) =>  {
          all_chunks.push(chunk);
        });
        res.on('end', () => {
          //console.log('end');
          let str = chunk.toString()
          let response_body = Buffer.concat(all_chunks);
          
          let variants = JSON.parse(response_body.toString()).reverse()
          variants.forEach((el: any) => {
            str = str.substring(0, el.pos) + el.s[0] + str.substr(el.pos + el.len, str.length + 1)
          });
          
          this.push(str.toUpperCase())
          cb()
        })
      })
      
      req.on('error', error => {
        console.error(error)
      })
      
      req.write(chunk.toString())
      req.end()

  }
}

function checkSpell (queue: Queue) {
  return new Promise((resolve) => {
    let item = queue.first.item.path
    //const ws = fs.createWriteStream(`file_${Date.now()}.txt`, 'utf8')
    fs.createReadStream(item, { encoding: 'utf8', highWaterMark: 2 * 1024 })
      .pipe(new CheckSpellStream())
      .pipe(fs
        .createWriteStream(`output/file_${Date.now()}.txt`, 'utf8')
        .on('finish', () => {
          console.log('Done');
          resolve(true)
        })
      )
  })
}