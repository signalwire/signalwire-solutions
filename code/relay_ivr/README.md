 # Relay IVR example

This is a simple dial-in IVR that implements a voice CAPTCHA and a in-call assistant example.

## Running the example

- Create an `.env` file according to `.env.example`
- Run `bundle install`
- Run `ruby assistant_consumer.rb`
- Set up a number on your SignalWire dasboard to call a Relay context named `incoming`
- Dial your number and prepare to find out if you are a human!
