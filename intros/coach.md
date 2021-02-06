# Conference monitoring and coaching with the "coach" attribute

In call center settings, the communication between customers and agents is very often performed via the `<Conference>` LaML verb.

That brings many advantages, including the ability for an agent to wait for callers to join, and reducing the connection time for a better customer experience.

For an introduction to LaML, refer to [this resource page](https://signalwire.com/resources/getting-started/introduction-laml).

## The <Conference> LaML verb

`<Conference>` is a type of `<Dial>` target in SignalWire LaML. It has all the features you would expect from conferencing: hold music, waiting for participants, moderantor controls, muting, and event broadcasting.

```
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Conference>Room 1234</Conference>
  </Dial>
</Response>
```

You can find a full reference [in the LaML documentation](https://docs.signalwire.com/topics/laml-xml/#voice-laml-dial-conference) but for now we will focus on our newest feature: the `coach` parameter.

## Coaching a conference

"Coaching", some times referred to as whisper or barge, is the ability to speak to a participant of a conference without anyone else hearing the conversation. It can actually be used to play any kind of audio to one participant, including alerts and notices.

To be able to trigger coaching, you will need to know its Call SID. There are APIs available [here](https://docs.signalwire.com/topics/laml-api/#api-reference-conference-participants) to list participants of an existing conference via REST, but the easier way will be to use an application to generate the LaML and store the SID somewhere.

In this tutorial, we will use a Python example built in Flask, an HTTP microframework.

```python
from flask import Flask, request
from signalwire.voice_response import VoiceResponse, Dial, Conference
app = Flask(__name__)

def get_conference_name():
  return "sample-conf"

def store_call_sid(call_sid):
  # actually do something to store it
  return true

def get_call_sid():
  # actually do something to return it
  return 'some-call-sid'

@app.route('/conference', methods=['POST'])
def enter_conference():
    response = VoiceResponse()
    dial = Dial()
    
    # this should be some kind of check or IVR to authorize a moderator
    if (request.form.get('From') == '+15557788999'):
      # a moderator, store the ID so we can coach him later
      store_call_sid(request.form.get('CallSid'))
      dial.conference(get_conference_name(), start_conference_on_enter=True, end_conference_on_exit=True)
    else:
      # not a moderator
      dial.conference(get_conference_name())
      
    response.append(dial)
    return response.to_xml()

@app.route('/coach', methods=['POST'])
def coach_conference():
    response = VoiceResponse()
    dial = Dial()
    dial.conference(get_conference_name(), coach=get_call_sid())
    response.append(dial)
    return response.to_xml()
```

In this scenario, Alice (our agent) will join the conference dialing in from `+15557788999`, and her Call SID will be stored. Bob, our customer, will call the same DID as Alice but will be placed in a conference without moderator permissions.

Ted, our supervisor, will then call in through a separate DID that drops him into the `/coach` LaML. After joining, Ted will be able to hear the conference, and talk to Alice without Bob hearing his voice.

## Why is coaching important?

The `coach` feature allows you to build a full-featured call center with supervisor capabilities. Together with REST-initiated asynchronous recording, it is the foundation of all contact center platforms.

Our team has built a complete demo for you to try out [in this repository](https://github.com/signalwire/snippets-coaching).

Go register at [SignalWire](https://signalwire.com) now and let us know about the exciting applications you will build!