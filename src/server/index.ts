import express from 'express'

const app = express()


app.listen(process.env.PORT, () => {
  console.log("Listening on port " + process.env.PORT)
})


app.get('/api', (req, res) => {
  res.send("hello")
})



