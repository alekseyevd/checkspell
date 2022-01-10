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

export default function validate(schema: any, value: any) {
  switch (schema.type) {
    case 'object':
      if (typeof value !== 'object') return false

      const keys = Object.keys(schema.properties)
      const required = schema.required || []
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (value[key] === undefined) return false

        const res = validate(schema.properties[key], value[key])
        console.log('res', res);
        
        if (!res) return false
      }
      return true

    case 'string':
      console.log(typeof value);
      if (typeof value !== 'string') return false
      return true;
  
    default:
      return false

  }
}