# Lenny Spam Call Filter with Relay and Node.js

Robocalling and spam calls have been increasing in number over the last year. Only in the US, there were 165.1 million robocalls placed in 2020, an average of 14.1 per person, including children and people who do not have a phone!

SignalWire can help with its Relay technology, which allows us to easily create a robocall protection service.

## The application

This application implements a call forwarding service with a voice CAPTCHA to determine if the caller is a human. If they are, it forwards the call to your phone number or the one you configured as the destination.

A [CAPTCHA](https://en.wikipedia.org/wiki/CAPTCHA) is an automated mechanism used to determine if the user of a service is a human or a machine. You have certainly interacted with visual ones such as "pick all of the pictures with a boat in it" on websites. In this application, we ask the caller for the result of the sum of two random numbers.

In case the incoming call is determined to be a robo-call, it is sent straight to Lenny (more on that below), and it is flagged as a spammer if someone tries to answer the CAPTCHA three times and fails. If the caller solves the CAPTCHA, their call gets forwarded to the configured private phone number for the DID.

Once the calls are connected, the user that received the call on his private number can press `**` on his DTMF keypad at any time and have the call instantly flagged as spammer and added to the database. That way, if a human unwanted caller makes it through the CAPTCHA, they can still be banned.

The application uses [node-persist](https://github.com/simonlast/node-persist), a simple file-based database, to keep track of flagged numbers and automatically reject calls. In a production application, you would maybe use a different database such as PostgreSQL. Every phone number is saved and remembered, so any callers who you want to receive calls from will automatically get through the second time they dial in. Spammers, on the other hand, will just be sent to have a chat with Lenny!

Remember, the application database is persistent, so you will have to remove the `.node-persist` folder in the directory to reset the database if you would like to test multiple times with the same number, or your call will be handled automatically as a spammer or a human depending on how you responded the first time.

### What is Lenny?

[Lenny](https://en.wikipedia.org/wiki/Lenny_(bot)) is one of the most widely known anti-spam chatbots, designed to waste the time of telemarketers.

It is a set of connected audio files, spoken in a somewhat-Australian accent, that uses generic phrases such as "Are you there?" to lure a spammer into a long conversation about its "family", a supposed very smart daughter, or other topics. The average time wasted for a spam call is over 10 minutes, and it is also very fun to listen to recordings.

The bot itself is simple in its ingenuity, but setting up your own version has always been complicated due to needing some telephony infrastrucure and a bit of logic. Signalwire Relay makes it easy to do.

## Configuration

Start by copying the `env.example` file to a file named `.env`, and fill in the necessary information.

The application needs a SignalWire API token. You can sign up [here](https://signalwire.com/signup), then put the Project ID and Token in the `.env` file as `SIGNALWIRE_PROJECT_KEY` and `SIGNALWIRE_PROJECT_KEY`.

You also need a DID (phone number) you either purchased from SignalWire or verified with us to use as the `FROM_NUMBER` for the caller ID.

If you sign up for the first time, your account will be start in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

Other configuration entries can be found in `config/default.json` . The `numberMap` entry in particular is where you map your private numbers to the SignalWire DIDs you will use as your public number. In the same JSON file, you can find and change the text for the greeting and the sound files in use. Make sure you restart the application after making configuration changes.

Make sure you set up the DID in your SignalWire dashboard to use the Relay handler with the context you have in `.env`. The default is `captcha`.

You can find more information, including where to get your credentials and how to set up the phone number, in [the Getting Started with Relay](https://github.com/signalwire/signalwire-guides/blob/master/intros/getting_started_relay.md) guide.

## Running the application

If you are running the application locally, first load  the `.env` file with `set -o allexport; source .env; set +o allexport`, then run `npm install` followed by `npm start`.

It is simpler to run the application via Docker, by first building the image with `docker build -t nodelenny .` followed by `docker run -it --rm -v ``pwd``/.node-persist:/app/.node-persist --name nodelenny --env-file .env nodelenny`.

If you prefer, you can just run `sh run_docker.sh` in your shell and the container will be built and started for you.

## Testing it

Give a call to the phone number you set up above and prepare for a simple math quiz... unless you are a robot!

## Application code

Let's now take a look at the more interesting code snippets. The full application code is available in [our repo](https://github.com/signalwire/signalwire-guides/tree/master/code/node_relay_captcha).

### The CAPTCHA loop

The following code snippet is what implements the voice CAPTCHA, asking the caller for the result of a simple sum.

```js
async function captcha(call) {
  var tries = CONFIG.general.captchaTries;
  var loops = 3;

  // activate the SignalWire denoiser
  var hints = ["denoise=true"];

  // add all possible answers to hints so it is more likely to hear numbers
  for (i = 0; i <= 20; i++) {
    hints.push(i);
  }

  var collect_params = {
    type: 'both',
    digits_max: 2,
    digit_timeout: 1.0,
    digits_terminators: '#',
    end_silence_timeout: 1.0,
    speech_hints: hints,
    media: [{
      type: 'tts',
      text: "",
      language: CONFIG.tts.lang,
      gender: CONFIG.tts.gender
    }]
  }

  var msg = CONFIG.general.introMessage + ", powered by SignalWire: ";

  await call.tts(msg);

  while (call.active && call.db.scammer == false && tries > 0 && loops > 0) {
    var rand1 = Math.random() * 10 + 1 << 0
    var rand2 = Math.random() * 10 + 1 << 0
    var answer = rand1 + rand2

    loops--;
    // ask the question
    collect_params.media[0].text = "What is " + rand1 + " plus " + rand2 + '?';;
    const result = await call.prompt(collect_params)

    if (result && result.successful) {
      console.log("heard " + result.result);

      var regex = new RegExp(answer, 'g');

      // using a regex is more effective and tolerant of possible ASR results
      if (result.result.match(regex)) {
        await call.tts(CONFIG.general.humanMessage);
        call.db.human = true;
        call.db.scammer = false;
        break;
      } else {
        tries--;
        if (tries == 0) {
          // you failed! probably a robo-call - or someone who can't count
          call.db.scammer = true;
          call.db.human = false;
          break;
        } else {
          await call.tts(CONFIG.general.wrongAnswerMessage + " " + "I will give you " +
            tries + " more " + (tries > 1 ? "tries" : "try"));
        }
      }
    } else if (result) {
      console.error("Bad result");
      await call.tts(CONFIG.general.missedDetectionMessage);
    }
  }

  return true;
}
```

### The in-call detection

This part of the application uses RELAY asynchronous methods to detect if a `**` sequence has been pressed by the user while the call is active. If that happens, it means someone went through the CAPTCHA but is still someone we would rather not speak to.

```js
async function completeCall(call) {
  // call "our" number, since the caller did complete the CAPTCHA correctly
  var dial = await call.connect({
    type: 'phone',
    to: CONFIG.numberMap[call.to],
    from: call.from,
    timeout: 30
  });

  if (dial.successful) {
    console.log("Waiting for call to end");

    dial.call.dialed = [];
    dial.call.digitParser = function(digit) {
      var self = dial.call;

      self.dialed.push(digit);
      while (self.dialed.length > 2) {
        self.dialed.shift();
      }
      if (self.dialed.length == 2) {
        var str = self.dialed.join("");
        console.log("code", str);

        if (str === "**") {
          // banish the spammer to the shadow realm of Lenny
          call.db.scammer = true;
          call.db.human = false;
          self.hangup();
        }
      }
    }

    // wait for any detection event. This could be used to implement more complex in-call apps
    dial.call.on('detect.update', (call, params) => {
      if (params.detect.type === "digit") {
        dial.call.digitParser(params.detect.params.event);
      }
    });

    const detectAction = await dial.call.detectAsync({
      type: "digit",
      timeout: 0
    });

    await dial.call.waitForEnded();
    console.log("Call has ended");
  } else {
    console.log("Call has failed");
    await call.tts(CONFIG.general.callFailureMessage);
  }

  if (!call.db.scammer) {
    await call.hangup();
  }

  return true;
}
```

## Documentation and useful links

[Relay Documentation](https://docs.signalwire.com/topics/relay/#relay-documentation)

[Relay Docker Images](https://github.com/signalwire/signalwire-relay-docker)

[Getting Started with Relay](https://github.com/signalwire/signalwire-guides/blob/master/intros/getting_started_relay.md)

[SignalWire 101](https://signalwire.com/resources/getting-started/signalwire-101)

Copyright 2021, [SignalWire Inc.](https://signalwire.com)