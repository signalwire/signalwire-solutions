# Simple PHP Call Screening and Voicemail example

This is a simple example of how to screen a call, then send the call to voicemail if you do not answer or do not want to take the call.

## Running locally

Use `composer install` to install dependencies, then run `TO_NUMBER=+15558877444 php -S localhost:8080 -t public/`, of course replacing `TO_NUMBER` with your own number you want to have calls screened to.

I recommend using [ngrok](https://ngrok.com) for local development, so you can point your SignalWire number to your ngrok tunnel.