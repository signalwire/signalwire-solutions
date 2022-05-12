require('dotenv').config();
let express = require('express');
let app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
const fetch = require('node-fetch');
const base64 = require('base-64');
const { RestClient } = require('@signalwire/node');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function apiRequest(endpoint, payload = {}, method = 'POST') {
  var url = `https://${process.env.SIGNALWIRE_SPACE}${endpoint}`

  var request = {
    method: method, // *GET, POST, PUT, DELETE, etc.
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Basic ${base64.encode(`${process.env.SIGNALWIRE_PROJECT_KEY}:${process.env.SIGNALWIRE_TOKEN}`)}`
    }
  }

  if (method != 'GET') {
    request.body = JSON.stringify(payload)
  }  
  const response = await fetch(url, request);
  return response.json(); // parses JSON response into native JavaScript objects
}


app.get('/', async (req, res) => {
  var sipApp = process.env.SIP_APP
  var defaultDestination = process.env.DEFAULT_DESTINATION
  var projectId = process.env.SIGNALWIRE_PROJECT_KEY
  var token = await apiRequest('/api/relay/rest/jwt', { expires_in: 120, resource: 'myclient' }) 
  res.render('index', { sipApp, defaultDestination, projectId, token: token.jwt_token });
})

app.post('/call', async (req, res) => {
  const client = new RestClient(process.env.SIGNALWIRE_PROJECT_KEY, process.env.SIGNALWIRE_TOKEN, { signalwireSpaceUrl: process.env.SIGNALWIRE_SPACE })
  const number = req.body.number;
  console.log('calling', number)

  client.calls
  .create({
      url: process.env.LAML_BIN,
      to: number,
      from: process.env.CALLER_ID
    })
    res.send('ok')
})

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000");
 });