require('dotenv').config();
const express = require('express');
const { RestClient } = require('@signalwire/node');

const fetch = require('node-fetch');

const PORT = process.env.PORT || 5000
const app = express();
const http = require('http').createServer(app);

app.set('view engine', 'ejs');

// some convenience functions

function respondAndLog(res, response) {
  console.log(response.toString());
  res.send(response.toString());
}

// Examples on how to interact with the SW API

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
  return await response.json();
}

async function createSipEndpoint(username, password) {
  var payload = {
    username: username,
    password: password,
    caller_id: "Friendly Person"
  }

  var response = await apiRequest('/api/relay/rest/endpoints/sip', payload);
  // response.sid 
  return response
}

async function deleteSipEndpoint(endpoint_sid) {
  var response = await apiRequest('/api/relay/rest/endpoints/sip/' + endpoint_sid, {}, "DELETE");
  return response
}

// application routes

app.post("/start", async (req, res, next) => {
  console.log(req.body);

  var response = new RestClient.LaML.VoiceResponse();
  dial = response.dial({timeout: 20});
  
  dial.number('+12027621401');
  respondAndLog(res, response);
});

http.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening to ${PORT}`);
});