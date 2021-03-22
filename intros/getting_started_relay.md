# Getting started with Relay

Relay is the next generation of interactive communication APIs available at SignalWire. It is a new, real-time web service protocol that provides for persistent, asynchronous connections to the SignalWire network.

Most providers use [REST APIs](https://docs.signalwire.com/topics/laml-api/#laml-rest-api) that rely on one-way communication. This adds latency and limits interactivity of real-time events. SignalWire's Relay APIs use WebSocket technology, which allow for simultaneous, bi-directional data transmission. Using Relay, you can deploy reliable, low latency, real-time communications.

Relay allows for interactive and advanced command and control. Complete control will enable easy transfers and injections across all endpoints, making it easier and quicker to build applications. Relay integrates easily with your products and infrastructure, enabling simple but powerful applications using Artificial Intelligence (AI) tools, data exchange, serverless technologies and more.

Finally, Relay enables communications tools to perform in the most popular and widely used environments, like web browsers, mobile devices, in the cloud, or within your own infrastructure.

## How do I get started?

The [Relay documentation](https://docs.signalwire.com/topics/relay/#relay-documentation) page has links to the SDK for all languages we support: [C#](https://docs.signalwire.com/topics/relay-sdk-dotnet), [Node.JS](https://docs.signalwire.com/topics/relay-sdk-nodejs), [Ruby](https://docs.signalwire.com/topics/relay-sdk-ruby), [PHP](https://docs.signalwire.com/topics/relay-sdk-php), [Python](https://docs.signalwire.com/topics/relay-sdk-python), and [Go](https://docs.signalwire.com/topics/relay-sdk-go).

You can install the SDK of your choice, or get started using our ready to go [Docker images](https://github.com/signalwire/signalwire-relay-docker).

We will be basing the tutorial on the code contained in the latter repo.

## What do I need?

If you would like to test this example out, the first thing to do is getting your SignalWire API keys.

### Signing up

You can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will start in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

### Getting your credentials

Head to `API` in your dashboard and create a new token. Take note of the Project ID and token and keep it on hand for later.

![API Credentials](/assets/api_credentials.png)

### Get a phone number

You will also need to set up a phone number to handle a call with Relay. Purchase a DID from the SignalWire dashboard, select "Relay" as the handler, and input `office` as the context.

![Relay Handler](/assets/relay_handler.png)

## Relay Consumer

The starting point for all Relay application is a `Consumer`. This class encapsulates the main connection and call handling features of Relay, and makes it very easy to add real time communications to your application.

In this article, we will be setting up our code for receiving a phone call.

Here is an example `Consumer` in various languages:

C#
```c#
using System;

using SignalWire.Relay;
using SignalWire.Relay.Calling;

namespace ConsumerExample
{
    [Serializable]
    internal class PhoneConsumer : Consumer
    {        
        protected override void Setup()
        {

        }

        protected override void OnIncomingCall(Call call)
        {
            AnswerResult resultAnswer = call.Answer();
            if (!resultAnswer.Successful)
            {
            }
            else
            {
                // incoming call failed
            }

            call.PlayTTS("The quick brown fox jumps over the lazy dog.");
            TerminateCall(call);
        }

        public void TerminateCall(Call call)
        {
            call.Hangup();
        }
    }
}
```

Node.JS
```js
const { RelayConsumer } = require('@signalwire/node')

const consumer = new RelayConsumer({
  project: process.env.SIGNALWIRE_PROJECT_KEY,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: ['office'],

  ready: async ({ client }) => {
    if (process.env.ENABLE_DEBUG) { 
      client.__logger.setLevel(client.__logger.levels.DEBUG)
    }
  },

  onIncomingCall: async (call) => {
    await call.answer()
    await call.playTTS({ text: 'Welcome to SignalWire!' });
    await call.hangup();
  }
})

consumer.run()
```

PHP
```php
<?php

require dirname(__FILE__) . '/vendor/autoload.php';

use Generator as Coroutine;
use SignalWire\Relay\Consumer;

class CustomConsumer extends Consumer {
  public $contexts = ['office'];

  public function setup() {
    $this->project = isset($_ENV['SIGNALWIRE_PROJECT_KEY']) ? $_ENV['SIGNALWIRE_PROJECT_KEY'] : '';
    $this->token = isset($_ENV['SIGNALWIRE_TOKEN']) ? $_ENV['SIGNALWIRE_TOKEN'] : '';
  }

  public function ready(): Coroutine {
    yield;
    // Consumer is successfully connected with Relay.
    // You can make calls or send messages here..
  }

  public function onIncomingCall($call): Coroutine {
    $result = yield $call->answer();
    if ($result->isSuccessful()) {
      yield $call->playTTS(['text' => 'Welcome to SignalWire!']);
    }
    yield $call->hangup();
  }
}

$consumer = new CustomConsumer();
$consumer->run();
```

Python
```python
from signalwire.relay.consumer import Consumer
import os

class CustomConsumer(Consumer):
  def setup(self):
    self.project = os.environ['SIGNALWIRE_PROJECT_KEY']
    self.token = os.environ['SIGNALWIRE_TOKEN']
    self.contexts = ['office']

  async def on_incoming_call(self, call):
    result = await call.answer()
    if result.successful:
      await call.play_tts(text='Welcome to SignalWire!')
      await call.hangup()

# Run your consumer..
consumer = CustomConsumer()
consumer.run()
```

Ruby
```ruby
require "signalwire"

Signalwire::Logger.logger.level = ::Logger::DEBUG if ENV['ENABLE_DEBUG']

class ::Consumer < Signalwire::Relay::Consumer
  contexts ['office']

  def on_incoming_call(call)
    call.answer
    call.play_tts text: 'Welcome to SignalWire'

    call.hangup
  end
end

::Consumer.new.run
```

### Anatomy of a `Consumer`

Looking at the Node.JS example in particular, we can see a few moving parts:

We include the necessary class:

```js
const { RelayConsumer } = require('@signalwire/node')
```

We set up the consumer using the credentials from above. We also set ourselves up to wait for calls from the `office` context (more on that later).

```js
const consumer = new RelayConsumer({
  project: process.env.SIGNALWIRE_PROJECT_KEY,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: ['office'],
```

We use one of the available event handlers to set up logging. Relay consumers provide `setup`, `ready`, and `teardown` to handle your specific requirements.

```js
  ready: async ({ client }) => {
    if (process.env.ENABLE_DEBUG) { 
      client.__logger.setLevel(client.__logger.levels.DEBUG)
    }
  },
```

We set up a specialized handler for controlling an incoming call.

```js
  onIncomingCall: async (call) => {
    await call.answer()
    await call.playTTS({ text: 'Welcome to SignalWire!' });
    await call.hangup();
  }
})
```

Finally, we just run the consumer.

```js
consumer.run()
```

Put the necessary code in a file named `index.js`.

## Running the consumer

To run the consumer using Docker, execute `docker run -e SIGNALWIRE_PROJECT_KEY=<YOUR PROJECT> -e SIGNALWIRE_TOKEN=<YOUR TOKEN> -e ENABLE_DEBUG=true  -v "/path/to/your/consumer.js:/app/consumer.js" signalwire/relay-example-node`.

You can find the complete Docker example [here](https://github.com/signalwire/signalwire-relay-docker/tree/master/node).

### Deploying Relay

Relay runs in its own process, not within an HTTP server, and requires no open ports, just an outbound connection to the SignalWire servers. This allows a Consumer to be very efficient, with a small footprint. The process can communicate with the other parts of your application using mechanisms such as REST, a processing queue, or using Relay Tasks, which we will touch on in Part 2.

## Make a phone call!

Call the SignalWire number you purchased above, and hear the welcome!

Remember, if you are in [Trial Mode](https://signalwire.com/resources/getting-started/trial-mode) you will need to call in from a verified phone number, or add $5 in credit to your account.

## Resources

Relay offers a huge amount of [features](https://docs.signalwire.com/topics/relay/#relay-documentation), including speech recognition, text-to-speech, answering machine detection, media manipulation and much more.

This was a first introduction, but stay tuned for Part 2, where we will cover inter-process communication with Relay Tasks, outbound dialing, and messaging.

Refer to the [Relay Documentation](https://docs.signalwire.com/topics/relay/), and make sure you go through [Getting Started with SignalWire](https://signalwire.com/resources/getting-started/signalwire-101) if you are new to the platform.

Our [Relay Dialer Demo](https://github.com/signalwire/relay-outbound-dialer-demo) and [Live Sentiment Analyis Demo](https://github.com/signalwire/sentiment-livewire) provide a look at more complex Relay apps.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!

