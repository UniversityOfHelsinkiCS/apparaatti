import path from 'path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectToDatabase } from './db/connection.ts'


import express from 'express'

const app = express()

app.use('/api/ping', (req, res, next) => {res.send("pong")})
app.use('/api', (_, res) => {
  res.sendStatus(404)
})

if (process.env.NODE_ENV === "production") {
  const DIST_PATH = path.resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../dist'
  )

  

  const INDEX_PATH = path.resolve(DIST_PATH, 'index.html')
  app.use(express.static(DIST_PATH))
  app.get('/*mint', (_, res) => res.sendFile(INDEX_PATH))
}

app.listen(process.env.PORT, async () => {
  await connectToDatabase()
  console.log(`Server running on port ${process.env.PORT}`)
})
