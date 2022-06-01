require('dotenv').config();
const express = require('express');
let { Task } = require('@signalwire/realtime-api')

const PORT = process.env.PORT || 5000
const app = express();
const http = require('http').createServer(app);

app.set('view engine', 'ejs');

app.get("/", async (req, res, next) => {
  await Task.send({
    project: process.env.SIGNALWIRE_PROJECT_ID,
    token: process.env.SIGNALWIRE_TOKEN,
    context: 'office',
    message: { hello: ['world', true] },
  })
  res.send("Sample Dialer")
});

http.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening to ${PORT}`);
});