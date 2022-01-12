import IRoute from './interfaces/IRoute'
import outputRoute from './routes/output'
import fileuploadRoute from './routes/fileupload'
import mainRoute from './routes/main'
import testRoute from './routes/testRoute'
import Controller from './lib/puppi/Controller'

const routes: Array<IRoute> = [
  // { method: 'get', path: '/', action: mainRoute},
  // // { method: 'post', path: '/api/v1/', action: fileuploadRoute },
  // // { method: 'get', path: '/output/', action: outputRoute },
  // { 
  //   method: 'post',
  //   path: '/test/{id}',
  //   action: testRoute,
  //   options: {
  //     validate: {
  //       query: 'nn'
  //     }
  //   }
  // }
  new Controller({
    path: '/test/{id}',
    method: 'post',
    validate: {
      body: {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
            format: 'date',
            description: 'description'
          },
          bar: {
            type: 'string',
            minLength: 3,
            maxLength: 8,
          },
          num: {
            type: 'integer'
          },
          ar: {
            type: 'array',
            items: {
              type: 'string'
            },
            minItems: 1,
            maxItems: 2,
          }
        },
        required: ['foo'],
        additionalProperties: false
      }
    }
  }),
]
export default routes


