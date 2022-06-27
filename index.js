const line = require('@line/bot-sdk')
const express = require('express')
const cors = require('cors')

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
  channelId: '1657195750',
  channelAccessToken: '8e+46rqxIcPyu+FtQvxCJRGKqyf2DIBtNCClvEn3382OJFXxz/VecuQTgNGuI+5wiJsiwy2u8K4OmYBmas9+ifiolbA8tF+HeQ1yn5TOu7CV8yO8WklrhXaulj6sXDlx/W/SsJ2JWeV5+eFTm/9M6QdB04t89/1O/w1cDnyilFU=',
  channelSecret: '5b3f795e87f74946937b15c306c2cdb0'
};
// create LINE SDK client
const client = new line.Client(config)

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
	// console.log(req, res)
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});
// event handler
function handleEvent(event) {
  console.log('event.replyToken', event.replyToken)
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  // create a echoing text message
  const echo = { type: 'text', text: event.message.text };
  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

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
  console.log(JSON.parse(JSON.stringify(req.body)))
  const userId = req.body.userId
  // const url = `${req.body.url}?id=${userId}`
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