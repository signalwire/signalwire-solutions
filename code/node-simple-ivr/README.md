# Simple IVR example in Node.js

This example shows how to respond to a SignalWire webhook using Node.js. The source code also includes some API interaction examples.

## Configuration

Start by copying the `env.example` file to a file named `.env`, and fill in the necessary information.

## Running the application

If you are running the application locally, first run `npm install`, followed by `npm start`.

It is simpler to run the application via Docker, by first building the image with `docker build -t nodeivr .` followed by `docker run -it --rm -p 3000:3000 --name nodeivr --env-file .env nodeivr`.

Either way, after starting the application head to `http://localhost:3000` to see a test page.

You may need to use a SSH tunnel for testing this code – we recommend [ngrok](https://ngrok.com/). After starting the tunnel, you can use the URL you receive from `ngrok` in your webhook configuration for your phone number.

When you configure a SignalWire DID to test, you should add `/entry` to the end of the URL you input, such as `https://yourname.ngrok.io/start`.

## Get started with SignalWire

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!