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

export default function validate(schema: any, value: any, prop: string): { result: boolean, errors?: Array<string>} {
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
      break

    case 'string':
      if (typeof value !== 'string') {
        errors.push(`typeof ${prop} must be 'string'`)
      }
      break

    case 'number':
      if (typeof value !== 'number') {
        errors.push(`typeof ${prop} must be 'number'`)
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