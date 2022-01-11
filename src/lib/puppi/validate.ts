// const schema = {
//   type: 'object',
//   properties: {
//     foo: {
//       type: 'string',
//       description: 'description'
//     }
//   },
//   required: ['foo']
// }

export default function validate(schema: any, value: any, prop: string = 'value'): { result: boolean, errors?: Array<string>} {
  let errors: Array<string> =  []
  switch (schema.type) {
    case 'object':
      if (typeof value !== 'object') {
        errors.push(`typeof ${prop} must be 'object'`)
        break
      }

      const required = schema.required || []
      const keys = Object.keys(schema.properties)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        
        if (!value.hasOwnProperty(key) && required.includes(key)) {
          errors.push(`${prop} must contain ${key}`)
        }

        if (value.hasOwnProperty(key)) {
          const res = validate(schema.properties[key], value[key], key)
          if (res.errors) errors = errors.concat(res.errors)
        }
      }

      if (schema.additionalProperties === false) {
        const keyValues = Object.keys(value).filter(k => {
          return !keys.includes(k)
        })
        if (keyValues.length) {
          errors.push(`properties ${keyValues.join(', ')} are not allowed`)
        }
      }
      break

    case 'string':
      if (typeof value !== 'string') {
        errors.push(`typeof ${prop} must be 'string'`)
        break
      }
      if (schema.minLength && value.length < schema.minLength) {
        errors.push(`length of poperty '${prop}' must be greater than ${schema.minLength} chars`)
        break
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        errors.push(`length of poperty '${prop}' must be less than ${schema.maxLength} chars`)
        break
      }
      break

    case 'integer':
      if (!Number.isInteger(value)) {
        errors.push(`typeof ${prop} must be 'integer'`)
      }
      break

    case 'number':
      if (typeof value !== 'number') {
        errors.push(`typeof ${prop} must be 'number'`)
        break
      }
      if (schema.minimum && value < schema.minimum) {
        errors.push(`${prop} must be greater than ${schema.minimum}`)
        break
      }
      if (schema.maximum && value > schema.maximum) {
        errors.push(`${prop} must be less than ${schema.maximum}`)
        break
      }
      break
  
    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`typeof ${prop} must be 'boolean'`)
      }
      break

    case 'array':
      if (!Array.isArray(value)) {
        errors.push(`typeof ${prop} must be 'array'`)
      }
      //to do validate schema.items
      break
    
    case 'null':
      if (value !== null)errors.push(`typeof ${prop} must be 'null'`)
      break
      
    default:
      errors.push('unknown type in schema')
      break
  }

  if (errors.length) return { result: false, errors }

  return { result: true }
}