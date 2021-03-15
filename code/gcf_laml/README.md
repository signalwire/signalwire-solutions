# LAML on Google Cloud Functions

This quick guide aims to provide a way to deploy a [SignalWire](https://signalwire.com) LAML XML application to [Google Cloud Functions](https://cloud.google.com/functions).

GCF is a serverless execution environment for building and connecting cloud services. It allows you to run a LAML webhook for your SignalWire application without having to host a web server, and it is a good alternative in case you need some simple logic that cannot be achieved just using XML.

The example application sets up a [LAML](https://docs.signalwire.com/topics/laml-xml/#laml-xml-specification) webhook to handle a phone call. In this case we will check the day of the week, and return a different greeting depending on the day. This is a simple logic, yet hard to accomplish using static LAML bins, and you might not want to set up a full web server just to host this snippet.

For more information about the basics of SignalWire and LAML, check out our [getting started guide](https://signalwire.com/resources/getting-started/signalwire-101).
## Setting up for GCF

Start with [the Google Cloud Functions HTTP tutorial](https://cloud.google.com/functions/docs/tutorials/http).

You will have to set up a few things:

- The `gcloud` command line tool
- A Google Cloud account with billing enabled
- Your first project
- `gcloud login`

## Node environment

There are no specific requirements other than `npm`. Make sure have NodeJS version `10` installed.

## Our sample code

The function we developed as a sample is pretty straightforward, and as you can see is plain Node Javascript, without anything specific to being deployed on Google Cloud Functions.

```js
const { RestClient } = require('@signalwire/node')

exports.helloLaml = (req, res) => {
  const response = new RestClient.LaML.VoiceResponse();
  try {
    var d = new Date();
    if (d.getDay() == 0) {
      response.say('Happy Sunday! Our store is closed today');
    } else {
      response.say('Hello! Our store is open from 9 to 6 today.');
    }
  } catch(err) {
    console.log(err.message);
  } finally {
    res.status(200)
      .set('Content-Type', 'text/xml')
      .send(response.toString());
  }
};
```

## Deploying

After setting up the necessary prerequisites above, clone this repository and deploy your function using the command below:

`cloud functions deploy hello-laml --trigger-http --runtime nodejs10 --entry-point=helloLaml --allow-unauthenticated`

In the above, we deploy a function named `hello-laml`, specifying it should use the `helloLaml` method from the `index.js` file as entrypoint, and we allow requests to come in unauthenticated.

The GCF CLI output will contain an URL similar to `https://us-central1-yourprojectname.cloudfunctions.net/hello-laml`. That is the URL to use as your webhook in the SignalWire dashboard.

## Sign Up Here

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!