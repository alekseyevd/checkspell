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

function decode(token: string) {
  const encoded = token.split('.')
  if (encoded.length !== 3) throw new Error('invalid token')
  const payloadEncoded = encoded[1]
  const headerEncoded = encoded[0]
  const hash = encoded[2]
  try {
    // const payloadEncoded = token.split('.')[1]
    // const payloadDecoded = Buffer.from(payloadEncoded, 'base64').toString()
    // return JSON.parse(payloadDecoded)
    const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64').toString())
    return {
      headerEncoded,
      payloadEncoded,
      hash,
      payload
    }
  } catch (error) {
    throw new Error('invalid token')
  }
}

function verify(token: string, secret: string) {
  const hmac = crypto.createHmac('sha256', secret)

  const { headerEncoded, payloadEncoded, hash, payload } = decode(token)
  const hashed = hmac.update(headerEncoded + '.' + payloadEncoded).digest('hex')
  if (hashed !== hash) throw new Error('Invalid token')

  if (payload.exp && new Date(payload.exp).getTime() < Date.now()) {
    throw new Error('token expired')
  }

  return payload
}

function update(token: string, secret: string, exp: number) {
  const { payload } = decode(token)
  return sign(payload, secret, exp)
}

export default { sign, verify, decode, update }