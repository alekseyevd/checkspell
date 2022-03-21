import 'dotenv/config'

export const PORT = process.env.NODE_ENV === 'production' ? 80 : 5000
export const TEMP_DIR = 'temp'
export const OUTPUT_DIR = 'output'
export const JWTSECRET = process.env.JWTSECRET
