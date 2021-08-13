import { Transform, TransformCallback } from 'stream'
import https from 'https'

export default class YaSpellTransform extends Transform {
  _transform(chunk: any, encoding: BufferEncoding, cb: TransformCallback): void {     
      const options = {
        hostname: 'speller.yandex.net',
        path: encodeURI(`/services/spellservice.json/checkText?text=${chunk.toString()}`),
        method: 'GET'
      }
      const req = https.request(options, res => {
        let all_chunks: Array<Buffer> = []
        if (res.statusCode !== 200) {
          return this.emit('error', new Error("Something happened"))
        }

        res.on('error', (error) => {
          return this.emit('error', error)
        })

        res.on('data', (chunk: Buffer) =>  {
          all_chunks.push(chunk);
        })

        res.on('end', () => {
          let str = chunk.toString()
          let response_body = Buffer.concat(all_chunks);
          
          let variants = JSON.parse(response_body.toString()).reverse()
          variants.forEach((el: any) => {
            str = str.substring(0, el.pos) + el.s[0] + str.substr(el.pos + el.len, str.length + 1)
          });
          
          this.push(str)
          cb()
        })
      })
      
      req.on('error', error => {
        return this.emit('error', error)
      })
      
      req.write(chunk.toString())
      req.end()
  }
}
