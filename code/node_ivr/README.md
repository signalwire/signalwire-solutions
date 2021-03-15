# Node.JS IVR with voicemail going to email

This advanced example uses the [SignalWire Node.JS SDK](https://github.com/signalwire/signalwire-node) to build a LAML application that implements a simple phone tree IVR with a few interesting features, including: 

- Parallel dialing to multiple phone numbers
- Recording a voicemail and using a dynamic greeting
- Transcribing voicemail and sending both the text and the recording via email

## Prerequisites

You will need a SignalWire account, and you can sign up [here](https://m.signalwire.com/signups/new?s=1).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

The application also uses [Mailgun](https://www.mailgun.com/) to send the emails, and you will need an API key from that service. You could also use any other email API.

## Configuration

There are quite a bit of configuration items required, but they are all pretty straightforward.

Start by copying the `env.example` file to a file named `.env`, and fill in the necessary information.

## Running the application

If you are running the application locally, first load  the `.env` file with `set -o allexport; source .env; set +o allexport`, then run `npm install` followed by `npm start`.

It is simpler to run the application via Docker, by first building the image with `docker build -t nodeivr .` followed by `docker run -it --rm -p 3000:3000 --name nodeivr --env-file .env nodeivr`.

Either way, after starting the application head to `http://localhost:3000` to see a test page.

You may need to use a SSH tunnel for testing this code – we recommend [ngrok](https://ngrok.com/). After starting the tunnel, you can use the URL you receive from `ngrok` in your webhook configuration for your phone number.

When you configure a SignalWire DID to test, you should add `/entry` to the end of the URL you input, such as `https://yourname.ngrok.io/entry`.

## Code snippets

The core of the application is the `entry` route, where we ask the user's choice via DTMF.

```js
app.post("/entry", (req, res, next) => {
  var response = new RestClient.LaML.VoiceResponse();
  gather = response.gather({ timeout: 5, numDigits: 1, action: formatUrl('mainmenu') })
  gather.say("Hello! Press 1 for sales, 2 for recruiting or 4 for accounting.")

  respondAndLog(res, response);
 });
 ```

 returns:

 ```xml
 <?xml version="1.0" encoding="UTF-8"?>
 <Response>
  <Gather timeout="5" numDigits="1" action="/mainmenu">
    <Say>Hello! Press 1 for sales, 2 for recruiting or 4 for accounting.</Say>
  </Gather>
</Response>
```

We then branch out to the correct action in the `mainmenu` handler.

```js
app.post("/mainmenu", (req, res, next) => {
  console.log(req.body);
  var response = new RestClient.LaML.VoiceResponse();

  switch (req.body.Digits) {
    case "2":
      dial = response.dial({timeout: 20, action: formatUrl('voicemail', "?Email=" + JOBS_EMAIL + "&Message=Recruiting")});
      var recruiters = RECRUITERS_GROUP.split(',')
      // this makes it so the recruiters are dialed all at the same time, first one to pick up wins
      recruiters.forEach(function(item) {
        dial.number(item);
      });
      break;
    case "4":
      dial = response.dial({timeout: 20, action: formatUrl('voicemail', "?Email=" + ACCOUNT_EMAIL + "&Message=Accounting")});
      dial.number(ACCOUNTING_GROUP);
      break;
    default:
      dial = response.dial({timeout: 20, action: formatUrl('primarysalesdial')});
      dial.number(PRIMARY_SALES);
  }
  
  respondAndLog(res, response);
});
```

For example, if the caller enters `2`, this is the LAML that is returned. Multiple `<Number>` entries are dialed at the same time, first one to pick up hangs up the other.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="20" action="/voicemail?Email=jobs@yourdomain.com&amp;Message=Recruiting">
    <Number>+15556677888</Number>
    <Number>+15559998877</Number>
  </Dial>
</Response>
```

What is very important here is the `action` parameter in each dial. The `voicemail` URL is what will be triggered when a call ends, and we will need to check if the call had actually connected to the intended department or not. If not, we will send them to voicemail. Note that we also pass the department name via query string so the greeting is dynamic.

```js
app.post("/voicemail", (req, res, next) => {
  var response = new RestClient.LaML.VoiceResponse();
  if (req.body.DialCallStatus != "completed") {
    // it means the call was not answered
    response.say("Our " + req.query.Message + " department is currently unavailable. Please leave a message after the beep.")
    action = formatUrl('voicemailhandler', "?Email=" + req.query.Email)
    response.record({transcribe: true, transcribeCallback: action, action: action })
  }
  respondAndLog(res, response);
 });
 ```

 generating the following LAML:

 ```xml
 <?xml version="1.0" encoding="UTF-8"?>
 <Response>
  <Say>Our Accounting department is currently unavailable. Please leave a message after the beep.</Say>
  <Record transcribe="true" transcribeCallback="/voicemailhandler?Email=accounts@yourdomain.com" action="/voicemailhandler?Email=accounts@yourdomain.com"/>
</Response>
```

 In the above, we set a `transcribeCallback` for the `<Record>` LAML action. This allows our callback to receive both the recording file URL and the transcription text.

 Handling the transcription is made a bit tricky by the fact that it is asynchronous, so the handler gets called twice, once for the recording URL and once for the transcription. We get around that by temporarily saving the recording in a hash in-memory. In a production environment, this should be replaced by a database.

 When the second request comes with the transcription, we email it using a convenience function.

 ```js
 app.post("/voicemailhandler", (req, res, next) => {
  if (req.body.TranscriptionText) {
    console.log("Got transcription, send email " + req.query.Email + RECORDING_DB[req.body.CallSid] + req.body.TranscriptionText);
    emailTranscription(req.query.Email, RECORDING_DB[req.body.CallSid], req.body.TranscriptionText, req.body.From);
    // avoid leaking memomry
    delete RECORDING_DB[req.body.CallSid]; 
  } else if (req.body.RecordingUrl) {
    console.log('stash recording for later');
    RECORDING_DB[req.body.CallSid] = req.body.RecordingUrl
  }

  var response = new RestClient.LaML.VoiceResponse();
  respondAndLog(res, response);
});
```

## Get started with SignalWire

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!