import express from 'express'

export function sendJSON (res: express.Response, status: number, content: object) {
  res.status(status)
  res.json(content)
}
