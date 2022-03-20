import crypto from 'crypto'

function sign(obj: any, secret: string) {
  const hmac = crypto.createHmac('sha256', secret)
  const header = JSON.stringify({
    alg: "HS256",
    typ: "JWT"
  })
  const payload = JSON.stringify(obj)
  const encoded = Buffer.from(header).toString('base64') + '.' + Buffer.from(payload).toString('base64')
  const hashed = hmac.update(encoded).digest('hex')
  return encoded + '.' + hashed
}

function verify(token: string, secret: string) {
  const hmac = crypto.createHmac('sha256', secret)

  const [ header, payload, hash ] = token.split('.')
  const hashed = hmac.update(header + '.' + payload).digest('hex')
  const headerDecoded = Buffer.from(header).toString('utf-8')
  const payloadDecoded = Buffer.from(payload, 'base64').toString()

  if (hashed !== hash) throw new Error('invalid token')

  return JSON.parse(payloadDecoded)
}

export default { sign, verify }