import IRoute from './interfaces/IRoute'
import outputRoute from './routes/output'
import fileuploadRoute from './routes/fileupload'
import mainRoute from './routes/main'
import testRoute from './routes/testRoute'

const routes: Array<IRoute> = [
  { method: 'get', path: '/', action: mainRoute},
  { method: 'post', path: '/api/v1/', action: fileuploadRoute },
  { method: 'get', path: '/output/', action: outputRoute },
  { 
    method: 'get',
    path: '/test/{id}',
    action: testRoute,
  }
]

export default routes.map(route => {
  return { 
    ...route,
    path: new RegExp("^" + route.path.replace(/\{[^\s/]+\}/g, '([\\w-]+)') + "$"),
    params: route.path.match(/\{[^\s/]+\}/g)?.map(k => k.slice(1, -1)) || []
  }
})

