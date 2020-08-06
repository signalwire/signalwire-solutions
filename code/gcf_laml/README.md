# LAML on Google Cloud Functions

This quick guide aims to provide a way to deploy a [SignalWire](https://signalwire.com) LAML XML application to [Google Cloud Functions](https://cloud.google.com/functions).

## Setting up for GCF

Start with [the Google Cloud Functions HTTP tutorial](https://cloud.google.com/functions/docs/tutorials/http).

You will have to set up a few things:

- The `gcloud` command line tool
- A Google Cloud account with billing enabled
- Your first project
- `gcloud login`

## Node environment

There are no specific requirements other than `npm`.

## Deploying

`cloud functions deploy hello-laml --trigger-http --runtime nodejs10 --entry-point=helloLaml --allow-unauthenticated`

In the above, we deploy a function named `hello-laml`, specifying it should use the `helloLaml` method from the `index.js` file as entrypoint, and we allow requests to come in unauthenticated.

The GCF CLI output will contain an URL like `https://us-central1-yourprojectname.cloudfunctions.net/hello-laml`. That is the URL to use as your webhook in the SignalWire dashboard.