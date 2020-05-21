const express = require("express");
const { RestClient } = require('@signalwire/node')
const DOMAIN = process.env.DOMAIN; // the domain the app is deployed at
const FROM_NUMBER = process.env.FROM_NUMBER; // the number faxes come from. Must be from you SW account
const SIGNALWIRE_PROJECT = process.env.SIGNALWIRE_PROJECT; // Project ID from your SW account
const SIGNALWIRE_TOKEN = process.env.SIGNALWIRE_TOKEN; // Project token from your SW account
const SIGNALWIRE_SPACE = process.env.SIGNALWIRE_SPACE; // Space name from your SW account

// methods should be in a different file in production ////
function formatUrl(action, querystring = '') {
  return "https://" + DOMAIN + "/" + action + querystring;
}
function respondAndLog(res, response) {
  console.log(response.toString());
  res.send(response.toString());
}
async function sendFaxTo(number, querystring = '') {
  const client = new RestClient(SIGNALWIRE_PROJECT, SIGNALWIRE_TOKEN, { signalwireSpaceUrl: SIGNALWIRE_SPACE })
  const fax = await client.fax.faxes.create({
    from: FROM_NUMBER,
    to: number,
    mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    statusCallback: formatUrl('callback', querystring)
  });
  console.log('Done', fax.sid)
  return fax.sid
}
// app startup ////
var app = express();
app.use(express.urlencoded());
// app routes ////
app.get("/status", (req, res, next) => {
  res.send("Sample Faxing")
});

app.post("/send", async (req, res, next) => {
  console.log(req.body);
  if (req.body.number) {
    console.log('sending +1' + req.body.number)
    sid = await sendFaxTo("+1" + req.body.number)
    res.send(sid);
  } else {
    res.send('no number specified');
  }
});

app.get("/quicksend", async (req, res, next) => {
  sid = await sendFaxTo(process.env.TO_NUMBER)
  res.send(sid);
});

app.post("/callback", async (req, res, next) => {
  console.log(req.body);

  if (req.body.FaxStatus == 'failed') {
    // retry if we haven't retried already
    if (req.query.retry) {
      console.log('no retry');
    } else {
      console.log('retrying');
      await sendFaxTo(req.body.To, '?retry=1')
    }
  }

  var response = new RestClient.LaML.VoiceResponse();
  respondAndLog(res, response);
});

//// run the service

app.listen(process.env.PORT || 3000, () => {
 console.log("Server running on port 3000");
});