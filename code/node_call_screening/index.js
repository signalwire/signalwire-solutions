require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 3000
const axios = require('axios')
const { RestClient } = require('@signalwire/compatibility-api');

app.post("/connect", async (req, res, next) => {

  var response = new RestClient.LaML.VoiceResponse();
  // pause for some amount of time to give us the chance to do the screening
  response.pause({ length: 10 });
  //response.say('Hello, please wait while we connect you to the call.');
  console.log("LAML: " + response.toString());
  res.send(response.toString());

  // // we have paused the call. now we need to send the alerts etc
  console.log('this should still be happening', req.body.CallSid, req.body.From)
  const client = new RestClient(
    process.env.SIGNALWIRE_PROJECT_ID,
    process.env.SIGNALWIRE_TOKEN,
    { signalwireSpaceUrl: process.env.SIGNALWIRE_SPACE }
  );

  // // this is where we would check the number against a database
  // // we simulate making an API request
  api_request = await axios.get('https://jsonplaceholder.typicode.com/users/1')
  console.log(api_request.data)

  if (req.body.From == '+14043287382') {
    // this is where we would send an alert
    console.log('SCREENING: this is an ACCEPTED number:' + req.body.From, req.body.CallSid)
    client.calls(req.body.CallSid).update({
      method: 'POST', 
      url: process.env.APP_HOST + '/dial'
    })
  } else {
    console.log('SCREENING: this is a REJECTED number:' + req.body.From)
    client.calls(req.body.CallSid).update({
      method: 'POST', 
      url: process.env.API_HOST + '/fail'
    })
  }
});

app.post("/dial", async (req, res, next) => {
  var response = new RestClient.LaML.VoiceResponse();
  // we just call MCI's read-back number, this should be your number
  response.dial('+18004444444');
  res.send(response.toString());
})

app.post("/fail", async (req, res, next) => {
  var response = new RestClient.LaML.VoiceResponse();
  // we could add something like a Lenny in here
  response.say('Sorry, your call has been rejected');
  res.send(response.toString());
})


app.listen(port, () => {
  console.log(`API ready on port ${port}`);
});