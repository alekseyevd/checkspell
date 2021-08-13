Send file to server

REQUEST BODY SCHEMA: multipart/form-data
```
POST /api/v1/
```
RESPONSE SCHEMA: application/json; charset=utf-8
```js
{
  result: true,
  data: <taskId>
}
```
If respons.result is true, you can use <taskId> to know task's status. Just make a request to /output/?id=<taskId>
```
GET /output/?id=<taskId>
```

RESPONSE SCHEMA: text/plain; charset=utf-8

or if task is in queue

RESPONSE SCHEMA: application/json; charset=utf-8
```js
{
  status: 'pending'
}
```
