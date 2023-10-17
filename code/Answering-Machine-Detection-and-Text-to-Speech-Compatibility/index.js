require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;
const bodyparser = require("body-parser");
const isE164PhoneNumber = require("is-e164-phone-number");
const { response } = require("express");
const sendingPhoneNumber = process.env.PHONE_NUMBER;

// Create a SW Client Using the Compatibility API SDK
const { RestClient } = require('@signalwire/compatibility-api')
const client = RestClient(process.env.PROJECT_ID, process.env.API_TOKEN, { signalwireSpaceUrl: process.env.SPACE_URL })

// Display home page from html file
app.use(bodyparser.urlencoded({ extended: true }));
app.use("/", express.static("html"));

// Create a text to speech webhook/ dialplan for 
app.post("/start", async (req, res, next) => {
  console.log(req.body);
  var response = new RestClient.LaML.VoiceResponse();
  say = response.say(text_for_speech);
  respondAndLog(res, response);
  display_amd(req)
});

// Send an API request to SW with the webhook containing our TTS
app.post("/sendCall", async (req, res) => {
  let { phoneno, body } = req.body;
  text_for_speech = body
  if (typeof body !== "string" || body === "") return res.send("Invalid body");
  if (!isE164PhoneNumber(phoneno)) return res.send("Invalid Phone Number");
  console.log("Sending call to phone number", phoneno);
  const call = await client.calls.create({
    url: process.env.APP_DOMAIN + '/start',
    to: phoneno,
    from: sendingPhoneNumber,
    // Declare Machine Detection
    machineDetection: "DetectMessageEnd"
  })
});

function display_amd(req) {
  const amd_result = req.body.AnsweredBy;
  console.log("This call was answered by   " + amd_result)
}
function respondAndLog(res, response) {
  //console.log("This is the response string " + response.toString());
  res.send(response.toString());
}
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});