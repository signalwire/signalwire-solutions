# import all our flask framework, os/dotenv for environment variables, SignalWire python SDK, and Regex
from flask import Flask, request, render_template
import os
from dotenv import load_dotenv
from signalwire.rest import Client as signalwire_client
import re

# load our environment variables and set them to variables we can use in our project
load_dotenv()

SIGNALWIRE_PROJECT_KEY = os.environ['SIGNALWIRE_PROJECT_ID']
SIGNALWIRE_TOKEN = os.environ['SIGNALWIRE_API_TOKEN']
SIGNALWIRE_SPACE = os.environ['SIGNALWIRE_SPACE_URL']
SIGNALWIRE_NUMBER = os.environ['SIGNALWIRE_FROMNUMBER']

#establish our SignalWire client
client = signalwire_client(SIGNALWIRE_PROJECT_KEY, SIGNALWIRE_TOKEN, signalwire_space_url=SIGNALWIRE_SPACE)
app = Flask(__name__)


# this is our index route that will return our SendSMS html file.
@app.route("/", methods=['GET', "POST"])
def smsmenu():
    return render_template('SendSMS.html')

#this route will handle our actual sms requests
@app.route("/createsmshandler", methods=['GET', "POST"])
def createsms():

    # get the phone number and sms body from the client
    pnum = request.args.get('pnum')
    body = request.args.get('smsbody')

    # call a function to validate this phone number
    pnumvalid = phonevalidation(pnum)

    # if that function returns false, the number isnt valid and we return this to the client to avoid making bad requests to SignalWire API
    if pnumvalid == False:
        return "Invalid Phone Number"
    # pnumvalid will return a phone number which will be our "to" number, from our SignalWire number, with the body from our client.
    else:
        success = client.messages.create(to=pnumvalid, from_=SIGNALWIRE_NUMBER, body= body)
        return "Message sent."

# phone validation, accepts one argument as pnum which will be where we pass our clients phone number
def phonevalidation(pnum):

    # Compile our regex pattern, this REGEX will search for a number with either 10 or 11 digits (Country code + 10DLC)
    pattern = re.compile(r'\d{10,11}$')

    # Strip the phone number of any additional characters such as () or -
    filterednum = re.sub("[^0-9]", "", pnum)

    # matches will return a list of strings matching our regex
    matches = pattern.findall(filterednum)

    # iterate over our matches list
    for match in matches:
        # check if the match is 11 digits, and starts with '1' for a US country code
        if len(match) == 11 and match[0] =="1":
            # concatenate a '+' to make the number e.164 compliant and return the match
            match = "+"+match
            return match
        # if the match length is 10 digits we will assume it is a us 10dlc number and concatenate '+1' to make it e.164 compliant
        if len(match) == 10:
            match = "+1"+match
            return match
    # if the number does not match either of our parameters it will return False
    else:
        return False

# runs our app for development testing
if __name__ == '__main__':
    app.run(debug=False)
