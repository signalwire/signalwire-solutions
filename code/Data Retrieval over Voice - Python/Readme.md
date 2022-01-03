# Overview
This guide will give a basic demonstration of how SignalWire's Communication API can be used to create a simple relay that will use speech and dtmf input to retrieve a user's data, provide that data over text-to-speech, and follow-up with an offer to text the data over sms.

## What do you need to run this code?
The only things you will need to run this code are [SignalWire's Python SDK](https://developer.signalwire.com/twiml/reference/client-libraries-and-sdks#python) and your SignalWire Credentials. You can find these by logging into your SignalWire space and navigating to the API tab. For more information on navigating your SignalWire space check [here](https://developer.signalwire.com/apis/docs/navigating-your-space)

# How to Run the Application

## Build and Run natively
Run app.py in your python environment of choice

# Step by Step code walkthrough
This application runs in one `app.py` file.
You will additionally need to create a .env file for your authentication

## Code Breakdown

### Getting Started:

First we will import our `Consumer` from the SignalWire Relay API, and import `os` which will handle our environment variables containing our SignalWire credentials.
Next we will establish our CustomConsumer class and create a function within that class called `setup`. This function will contain our environment variables, as well as our relay context, and some additional variables.

`self.clientlist` is a python dictionary where each key is assigned to a list of data.
`self.nameslist` is a python list that will gather our keys to pass to the `speech_hints` parameter later on
`self.mapper` will assist us in catching bad inputs and `self.menuloop` handles our `while` loop.

```python
from signalwire.relay.consumer import Consumer
import os


class CustomConsumer(Consumer):
    def setup(self):
        # holds our environment variables
        self.project = os.environ['ProjectID']
        self.token = os.environ['AuthToken']
        self.url = os.environ['SpaceUrl']

        # make sure your signalwire number is pointed to this context
        self.contexts = ['office']

        # this is our simulated data to retrieve
        self.clientlist = {"example man": ["December 15th at 2pm", "1995"], "example woman":["December 20th at 2pm","1999"]}

        # this nameslist will be used to create speech hints to improve our detection
        self.nameslist = []

        # helps handle bad input
        self.mapper = "default"

        # controls our menu loop
        self.menuloop = "0"
```

### Handling Incoming Calls

Within the consumer class we will create a function called `on_incoming_call` and pass the `self` and `call` arguments. When a phone number pointed to the `office` context we set in the previous step, the consumer will pass the call to this function. From here we will answer the call, and if we answer successfully we will begin the main loop of our application. When this loop starts it will reset our `menuloop`, `clientid`, and `mapper` variables, just to be safe. Finally, this is the point where we will poll our `clientlist` dictionary and append the keys to our `nameslist`.

```python
 async def on_incoming_call(self, call):
        result = await call.answer()

        # starts our IVR only if the call is successful
        if result.successful:

            # resets menu loop and client id with each call
            self.menuloop = "0"
            clientid = ""

            while self.menuloop == "0":
                # resets our bad input catcher at beginning of the loop
                self.mapper = "default"

                # creates a list of names to be used as speech hints
                for k in self.clientlist:
                    self.nameslist.append(k)
```

### Getting a Client ID
Now that we have our `nameslist` populated, we can prompt the user with text-to-speech and ask them for their first and last name. If we receive input from the caller, but it is not recognized in the `clientlist`, we will set our `mapper` to unrecognized which will play some more tts and allow the caller to try again.

If the input was found, we will loop through the `clientlist` and set our `clientid` to the key. After that we will call our `pinprompt` function and pass the `call` and `clientid` variables.

If for whatever reason our input is not successful, our `mapper` will default to play some tts and start from the beginning, additionally a check is made to ensure that dropped calls do not hang the consumer and make it unavailable for further use.
```python
								# first contact, prompt user for their name
                result = await call.prompt_tts(prompt_type="speech",
                                               text="Please say your first and last name.",
                                               end_silence_timeout="2",
                                               speech_hints=self.nameslist)

                # if our result is successful, but not recognized as a client
                if result.successful and result.result not in self.clientlist:
                    self.mapper = "unrecognized name"

                # if our result was successful and found in client list
                if result.successful and self.mapper != "unrecognized name":

                    # loop through client list and set clientid to the matching key
                    for k in self.clientlist:
                        if result.successful and result.result == k:
                            clientid = k

                            #send call and clientid to the pinprompt function
                            await self.pinprompt(call,clientid)

                # catches bad inputs - this is what will happen by default
                if self.mapper == "default":
                    await call.play_tts(
                        text="Sorry. I am still a new AI, and didn't understand your request. Try again.")

                # if a client's name could not be found
                if self.mapper == "unrecognized name":
                    await call.play_tts(
                        text="Sorry, I could not find your name in our record. Please try again.")

                # ends the while loop when a call ends or is dropped
                if call.state != "answered":
                    self.menuloop = "1"
```

### Using Pinprompt

This function is called when a caller is successfully found in our `clientlist` dictionary. First we will ask them for a pin, which in this example is their birth-year. If the pin is incorrect, we will inform the user and kick them back to the main menu. 

If the pin is correct, we will provide the caller with the requested information over text-to-speech, and finally send them to the `smsoffering` function once again passing the `call` and `clientid` variables.
```python
  async def pinprompt(self,call,clientid):

        # prompts user for their pin
        result = await call.prompt_tts(prompt_type="digits",
                                       text=clientid + "Please enter the year you were born.",
                                       digits_max="4")

        # if the pin is incorrect we are kicked back to the main menu
        if result.successful and result.result != self.clientlist[clientid][1]:
            await call.play_tts(text="That was not correct. Please try again.")

        # if the pin is correct we will tts their appointment details
        if result.successful and result.result == self.clientlist[clientid][1]:
            await call.play_tts(text=clientid + " your appointment is on " + self.clientlist[clientid][0])

            # next we will call our smsoffering function
            await self.smsoffering(call,clientid)
```

###Offering data over SMS

Now we will simply ask the user if they would like to receive a text with the information we have retrieved for them.
If the user says yes, we will use the information from our `call` to create a message with the appropriate information, and end the call. If the users says no, or the user's input could not be parsed, we will just say Goodbye and hang up.

The final two lines instruct the consumer to run when we run the script.
```python
async def smsoffering(self,call,clientid):

        # ask the user if they would like to receive a message with their appointment details
        result = await call.prompt_tts(prompt_type="speech",
                                       text="Would you like to recieve a text with this information?",
                                       end_silence_timeout="1",
                                       speech_hints=("yes", "no")
                                       )

        # if yes, send details to caller with sms and hang up
        if result.successful and result.result == "yes":
            txtresult = await self.client.messaging.send(context='office', from_number=call.to_number,
                                                         to_number=call.from_number,
                                                         body=clientid + " your appointment is on " +
                                                              self.clientlist[clientid][0])

            await call.play_tts(text="Your details will be messaged to you shortly. Goodbye.")
            await call.hangup()

        # otherwise just hang up
        if not result.successful or result.result != "yes":
            await call.play_tts(text="Goodbye.")
            await call.hangup()
            
# Runs the consumer
consumer = CustomConsumer()
consumer.run()
```

# Wrap Up.
This guide dives into a variety of tools that SignalWire's communication API provides to create a powerful data retrieval application in barely over 100 lines of code(including comments!). 

## Required Resources:
[Github Repo](soontm)
[Python SignalWire SDK](https://developer.signalwire.com/compatibility-api/reference/client-libraries-and-sdks#python)

# Sign Up Here

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Please feel free to reach out to us on our [Community Slack](https://join.slack.com/t/signalwire-community/shared_invite/zt-sjagsni8-AYKmOMhP_1sVMvz9Ya_r0Q) or create a Support ticket if you need guidance!
vvv