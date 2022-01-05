from signalwire.relay.consumer import Consumer
import os
from dotenv import load_dotenv

load_dotenv()


class CustomConsumer(Consumer):
    def setup(self):
        # holds our environment variables
        self.project = os.environ['SIGNALWIRE_PROJECT_ID']
        self.token = os.environ['SIGNALWIRE_API_TOKEN']
        self.url = os.environ['SIGNALWIRE_SPACE_URL']

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

    # function listens for incoming calls
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

    # defines the function that will handle user pins
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

    # this function will offer an sms copy of their appointment details
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