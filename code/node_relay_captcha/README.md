# Lenny Spam Call Filter with Relay and Node.js

This application implements a voice CAPTCHA to determine if the caller is a human. If they are, it forwards the call to your phone number.

In case it is a robo-call, it is sent straight to Lenny (more on that below), and it is flagged as a spammer if someone tries to answer the CAPTCHA three times and fails. If the caller solves the CAPTCHA, their call gets forwarded to the configured private phone number for the DID.

Once the calls are connected, the user that received the call on his private number can press `**` on his DTMF keypad and have the call instantly flagged as spammer and added to the database.

The application uses [node-persist](https://github.com/simonlast/node-persist), a simple file-based database, to keep track of flagged numbers and automatically reject calls.

### What is Lenny?

[Lenny](https://en.wikipedia.org/wiki/Lenny_(bot)) is one of the most widely known anti-spam chatbots, designed to waste the time of telemarketers.

It is a set of connected audio files, spoken in a somewhat-Australian accent, that uses generic phrases such as "Are you there?" to lure a spammer into a long conversation about its "family", a supposed very smart daughter, or other topics. The average time wasted for a spam call is over 10 minutes, and it is also very fun to listen to recordings.

The bot itself is simple in its ingenuity, but setting up your own version has always been complicated due to needing some telephony infrastrucure and a bit of logic. Signalwire Relay makes it easy to do.

## Configuration

Start by copying the `env.example` file to a file named `.env`, and fill in the necessary information.

The application needs a SignalWire API token. You can sign up [here](https://signalwire.com/signup), then put the Project ID and Token in the `.env` file as `SIGNALWIRE_PROJECT_KEY` and `SIGNALWIRE_PROJECT_KEY`.

You also need a DID (phone number) you either purchased from SignalWire or verified with us to use as the `FROM_NUMBER` for the caller ID.

If you sign up for the first time, your account will be start in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

Other configuration entries can be found in `config/default.json` . The `numberMap` entry in particular is where you map your private numbers to the SignalWire DIDs you will use as your public number.

Make sure you set up each DID in your SignalWire dashboard to use the Relay handler with the context you have in `.env`. The default is `captcha`.

## Running the application

If you are running the application locally, first load  the `.env` file with `set -o allexport; source .env; set +o allexport`, then run `npm install` followed by `npm start`.

It is simpler to run the application via Docker, by first building the image with `docker build -t nodelenny .` followed by `docker run -it --rm -v ``pwd``/.node-persist:/app/.node-persist --name nodelenny --env-file .env nodeivr`.

## Documentation links

[Relay Documentation](https://docs.signalwire.com/topics/relay/#relay-documentation)

[Relay Docker Images](https://github.com/signalwire/signalwire-relay-docker)

[SignalWire 101](https://signalwire.com/resources/getting-started/signalwire-101)

Copyright 2021, [SignalWire Inc.](https://signalwire.com)