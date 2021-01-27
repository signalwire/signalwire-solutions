# Ruby and SIP Outbound Call Center example

To install prerequisites, run `bundle install`.

Configure your application by copying `env.example` to `.env` and editing it with your credentials, including the necessary application domain (see below).

For more information about your credentials, you can check out [this post](https://signalwire.com/resources/guides/laml-rest-api)

To run the application, execute `dotenv ruby server.rb`.

To test the application with SignalWire while running locally, I recommend using [ngrok](https://ngrok.com/).

The application runs on port `3000` by default.

You can then visit `your-ngrok-domain` to use the SIP.js test client that is provided.