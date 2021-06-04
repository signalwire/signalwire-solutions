# SignalWire Video SDK Getting Started Sample Application

This example uses the [SignalWire Video API](https://docs.signalwire.com/topics/api/video) and the [SignalWire Video SDK for Javascript](https://docs.signalwire.com/topics/api/sdk/js) to
create a simple video conferencing software.

## Prerequisites

You will need a SignalWire account, and you can sign up [here](https://m.signalwire.com/signups/new?s=1). From your SignalWire account, you'll need to note your Project ID, your Space URL and
an API token which you can generate from the API tab in your dashboard.

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

## Configuration

To store your SignalWire API credentials, you need to create a file named `.env` at the root of the directory (next to `package.json`). The three project variables we previously noted will be placed there in the following format.

```
PROJECT_ID=<Project ID here>
API_TOKEN=<Your API token here>
API_URL=https://<your space name>.signalwire.com/api/video
```

## Running the application

If you are running the application locally, simply create an `.env` file and set it up as above. Then start the application with `node index.js`.

It is simpler to run the application via Docker, It is simpler to run the application via Docker, by first building the image with `docker build -t videosdk .` followed by `docker run -it --rm --name nodelenny --env-file .env videosdk`.

Either way, after starting the application, head to `http://localhost:4000` to see a test page.

## Get started with SignalWire

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!
