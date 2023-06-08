# SignalWire Call Screening demo

This demo showcases how to hold a call while checking for something on an API, then sending the call to the correct destination by updating it.

## Running the demo

Copy `env.example` to `.env` and fill in the values using your SignalWire API keys. You will also need to know where the application will be reachable. If you are running locally, I suggest using `ngrok` to expose port 3000.

Go to your SignalWire account and point a phone number or a SIP domain app to the webhook you specified. For example, using `ngrok`, it will be something like `https://yourname.ngrok.io/connect`

Run `npm install` then `node index.js` and call the number you set up.