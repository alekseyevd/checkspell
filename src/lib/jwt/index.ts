import crypto from 'crypto'

function sign(obj: any, secret: string, exp?: number) {
  const hmac = crypto.createHmac('sha256', secret)
  const header = JSON.stringify({
    alg: "HS256",
    typ: "JWT"
  })
  const payload = exp 
    ? JSON.stringify({ ...obj, exp: new Date(Date.now() + exp) })
    : JSON.stringify(obj)

  const encoded = Buffer.from(header).toString('base64') + '.' + Buffer.from(payload).toString('base64')
  const hashed = hmac.update(encoded).digest('hex')
  return encoded + '.' + hashed
}

function verify(token: string, secret: string) {
  try {
    const hmac = crypto.createHmac('sha256', secret)

    const [ header, payloadEncoded, hash ] = token.split('.')
    const hashed = hmac.update(header + '.' + payloadEncoded).digest('hex')
    if (hashed !== hash) throw new Error('Invalid token')

    const payloadDecoded = Buffer.from(payloadEncoded, 'base64').toString()
    
    const payload = JSON.parse(payloadDecoded)
    if (payload.exp && new Date(payload.exp).getTime() < Date.now()) {
      throw new Error('token expired')
    }

    return payload
  } catch (err) {
    throw new Error('invalid token')
  }
}

function decode(token: string) {
  try {
    const payloadEncoded = token.split('.')[1]
    const payloadDecoded = Buffer.from(payloadEncoded, 'base64').toString()
    return JSON.parse(payloadDecoded)
  } catch (error) {
    throw new Error('invalid token')
  }
}

function update(token: string, secret: string, exp: number) {
  const payload = decode(token)
  return sign(payload, secret, exp)
}

export default { sign, verify, decode, update }