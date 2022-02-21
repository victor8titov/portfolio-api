import express, { Response } from 'express'

const router = express.Router()

function sendJSONresponse (res: Response, status: number, content: object) {
  res.status(status)
  res.json(content)
}

router.get('/test', (req, res) => {
  console.log('test get')
  sendJSONresponse(res, 200, { ms: 'test get' })
})

router.post('/test', (req, res) => {
  console.log('test post', req.body, req.query)
  sendJSONresponse(res, 200, { ms: 'test post' })
})

router.put('/test', (req, res) => {
  console.log('test put')
  sendJSONresponse(res, 200, { ms: 'test put' })
})

router.delete('/test', (req, res) => {
  console.log('test delete')
  sendJSONresponse(res, 200, { ms: 'test delete' })
})

export { router as apiRouters }
