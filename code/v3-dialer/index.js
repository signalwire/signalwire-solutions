require('dotenv').config();
const express = require('express');
let { Task } = require('@signalwire/realtime-api')

const PORT = process.env.PORT || 5000
const app = express();
const http = require('http').createServer(app);

app.use(express.json());
app.set('view engine', 'ejs');

app.get("/", async (req, res, next) => {
  res.render('index', { destination: process.env.DEFAULT_DESTINATION })
})

app.post("/send", async (req, res, next) => {
  console.log(req.body);
  await Task.send({
    project: process.env.SIGNALWIRE_PROJECT_ID,
    token: process.env.SIGNALWIRE_TOKEN,
    context: 'office',
    message: { 
      number: req.body.number,
      message: req.body.message,
    }
  })
  
  res.json({ status: 'ok' });
});

http.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening to ${PORT}`);
});