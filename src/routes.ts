import IRoute from './interfaces/IRoute'
import outputRoute from './routes/output'
import fileuploadRoute from './routes/fileupload'
import mainRoute from './routes/main'

export const routes: Array<IRoute> = [
  { method: 'get', path: '/', action: mainRoute},
  { method: 'post', path: '/api/v1/', action: fileuploadRoute },
  { method: 'get', path: '/output/', action: outputRoute },
]