const line = require('@line/bot-sdk')
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const app = express()
app.use(cors())  // 不限定網域
app.use(express.static(__dirname))
// app.use(express.json()) // 不全域使用，使用單隻
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`i am listening on ${port}`)
});

// 引用 swagger
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')
// swagger 網址為 localhost:${port號}/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const config = {
  channelId: process.env.channelId,
  channelAccessToken: process.env.channelAccessToken,
  channelSecret: process.env.channelSecret
};
// create LINE SDK client
const client = new line.Client(config)

// 發訊息
app.post('/sendMessage', express.json(), urlencodedParser, (req, res) => {
  console.log(JSON.parse(JSON.stringify(req.body)))
  const userId = req.body.userId
  const name = req.body.name
  const time = req.body.time
  const title = req.body.type === '1' ? 'Appointment confirmation' : 'Appointment reminder'

  const message = { 
    type: 'text',
    text: `${title} - Hi ${name}, your appointment is ${time}`
  };
  /* const message = { type: 'text', text: 'i am happy' }; */
  client.pushMessage(userId, message)
  .then(() => {
    console.log('done')
    res.status(200).json('done')
  })
  .catch((err) => {
    console.log('error', err)
  });
})

// 發問卷
app.post('/sendSurvey', express.json(), urlencodedParser, (req, res) => {
  const userId = req.body.userId
  const url = req.body.url

  const message = { 
    type: 'text', 
    text: `Please fill in service survey to let us know your experience. ${url}` 
  }
  client.pushMessage(userId, message)
  .then(() => {
    console.log('done')
    res.status(200).json('done')
  })
  .catch((err) => {
    console.log('error', err)
    res.status(400).json('error')
  });
})