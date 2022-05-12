# Simple call center style example

This application will place a call to a specified phone number, while at the same time connecting the browser to a conference.

## Call flow

The browser client calls a SIP Domain App configured to invoke a LAML Bin that simply goes to a conference, like this:

```
<Response>
  <Dial>
    <Conference>conferencename</Conference>
  </Dial>
</Response>
``` 

At the same time, a REST API request instructs SignalWire to call the specified phone number:

```
client.calls
  .create({
      url: process.env.LAML_BIN,
      to: number,
      from: process.env.CALLER_ID
    })
    res.send('ok')
```

When the destination number answers, the same LAML Bin is used to place the called party in the same conference as the agent.

## Setting up

After registering to SignalWire, go to the LaML > Bins page in the dashboard and set up a LAML bin with the above content. Copy the URL.

Now head to SIP > Domain Apps, create a new one, give it a name and a URL, specify LaML Webhook as the handler and input the Bin URL as the value. The rest can be left as default. Make a note of the app URL.

Copy `env.example` to `.env` and fill in the values from your SignalWire account and the previous steps.

Run `npm install` followed by `node index.js` and head to http://localhost:3000.