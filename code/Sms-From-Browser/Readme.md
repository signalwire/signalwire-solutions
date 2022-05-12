# Overview

This guide will use flask to create a simple web application that can send sms through the browser.

# What do I need?

Find the full code on Github [here]( )
You will need the [SignalWire Python SDK](https://developer.signalwire.com/compatibility-api/reference/client-libraries-and-sdks#python) as well as [Flask](https://flask.palletsprojects.com/en/2.0.x/installation/#install-flask) to handle the web framework.

Additionally you will need a signalwire account which you can create [here](https://m.signalwire.com/signups/new?s=1). You will also need your SignalWire API credentials which you can find in the `API` tab of your SignalWire dashboard. For more information on navigating your SignalWire space check [here](https://developer.signalwire.com/apis/docs/navigating-your-space).

# How to run

## Run Natively

Run app.py in your python environment of choice.
This app will be using Flask, which will use port 5000 on your localhost by default. 

#Code Walkthrough

This application has two components `app.py` which is our "server" component, and a `templates` folder which holds our `sendsms.html`, this is our client component.
Additionally there is an `example.env` file you can use to fill in with your SignalWire credentials and save as `.env`

## Server-side code

### Set-up

The server-side code for this is very simple, first we will import the required packages, load then set our environment variables, and create a client that will handle our sms requests.

```python
from flask import Flask, request, render_template, redirect
import os
from dotenv import load_dotenv
from signalwire.rest import Client as signalwire_client
import re

load_dotenv()

SIGNALWIRE_PROJECT_KEY = os.environ['SIGNALWIRE_PROJECT_ID']
SIGNALWIRE_TOKEN = os.environ['SIGNALWIRE_API_TOKEN']
SIGNALWIRE_SPACE = os.environ['SIGNALWIRE_SPACE_URL']
SIGNALWIRE_NUMBER = os.environ['SIGNALWIRE_FROMNUMBER']

client = signalwire_client(SIGNALWIRE_PROJECT_KEY, SIGNALWIRE_TOKEN, signalwire_space_url=SIGNALWIRE_SPACE)
```

### Index Route

Next we will create a route that returns our `sendSMS.html` form. When integrating this project, this may not be needed as you can simply embed the code from `sendSMS.html` into any html page your project is already using.

```python
@app.route("/", methods=['GET', "POST"])
def smsmenu():
    return render_template('sendSMS.html')
```

### Create Sms/Handler Route

Finally for our server-side we will create a route that actually handles the creation of our sms requests to the client. 

First we will get the `pnum` and `smsbody` values from the client and call our `phonevalidation()` function, passing our `pnum`.
If `phonevalidation()` returns `False` we will let the client know that phone number wasn't valid. Otherwise we will create a request using `pnumvalid` as the "to" number and the `body` we retrieved from the client as our message body, and return "Message Sent." In this case there is no validation for if a message was delivered successfully, only that the request was created.

Alternatively if our conditions aren't met, we just assume something went wrong and return a message stating so to the client.


```python
@app.route("/createsmshandler", methods=['GET', "POST"])
def createsms():
    pnum = request.args.get('pnum')
    body = request.args.get('smsbody')

    pnumvalid = phonevalidation(pnum)

    if pnumvalid == False:
        return "Invalid Phone Number"

    else:
        success = client.messages.create(to=pnumvalid, from_=SIGNALWIRE_NUMBER, body= body)
        return "Message sent."
```

### Phone Number Validation
Validating phone numbers helps reduce improperly formatted requests to SignalWire, which in turn means your messages are delivered to the right target more appropriately! We can do this with some basic regex using python's default regex package `re`.

First we will define a new function and accept one `pnum` parameter. When we call this function in `createsms()` we will pass the phone number from our client as `pnum`.
Next we define our compiled regex as `pattern`. Our regex is simply looking for a string of 10 or 11 digits.
Then we will create a `filterednum` variable which will strip all non-digit characters from our phone number. The goal is to eliminate any white-space or special characters, for instance `1(123)-123-1234` would be stripped down to `11231231234`.

Once we have our number filtered we can use the regex `findall` method to return a list of strings that match our criteria. We should only get 0 or 1 matches. If we get 0 matches, we return `False` which will return to our function.

If we do get a match, we will check the length of the match. If the length is 11 digits, and the leading digit is a "1" we can assume this user included the country-code and append a `+` to the string and return our e.164 formatted phone number to our function which will then use it as the `to` number in our text.
Similarly, if the length of our match is 10 digits we will assume the user did not include an area code and append `+1` before returning our number to the function.

```python
def phonevalidation(pnum):

    pattern = re.compile(r'\d{10,11}$')
    filterednum = re.sub("[^0-9]", "", pnum)
    matches = pattern.findall(filterednum)

    for match in matches:
        if len(match) == 11 and match[0] =="1":
            match = "+"+match
            return match
        if len(match) == 10:
            match = "+1"+match
            return match
    else:
        return False
```
## Client-side Code

Our client-side code is just a simple html file `SendSMS.html`.
Most of this code is just the default/boilerplate HTML. The heart of our client really boils down to the `<body>`.

First we will create a new `<form>` with the action url being our `/createsmshandler` route. Once this is set we can create a `<label>` that will describe what our form does.
Now we can create our two text inputs `pnum` which is our target phone number, and `smsbody` which is the message the client would like to send. These will be passed as arguments to `/createsmshandler`.

Example:  `/createsmshandler?pnum=%2B11231231234&smsbody=Your+SMS+body+here`

Finally, we have to create a `<button>` which will be used to submit our request and ensure we close our `</form>` tag.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Send A Message</title>
</head>
<body>
        <form action = "/createsmshandler">
        <label for="pnum">Send an SMS</label><br>
        <input type="text" id="pnum" name="pnum" value="+18001234567">Send SMS To</input></br></br>
        <input type="text" id="smsbody" name="smsbody" value="Your SMS body here">Sms Body</input></br></br>
        <button id="submitButton" class="float-left submit-button" >Send SMS</button>
        </form>
</body>
</html>
```

# Wrap Up
This is a simple and flexible way to allow data to be passed from the client to your server which can then be validated before we create requests to the SignalWire API! While this guide focuses on SMS this same principle can be used to implement a wide variety of features into your web app!

## Required Resources:
[Github Repo](soontm)

[Python SignalWire SDK](https://developer.signalwire.com/compatibility-api/reference/client-libraries-and-sdks#python)

# Sign Up Here

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Please feel free to reach out to us on our [Community Slack](https://join.slack.com/t/signalwire-community/shared_invite/zt-sjagsni8-AYKmOMhP_1sVMvz9Ya_r0Q) or create a Support ticket if you need guidance!