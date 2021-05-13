# How to Forward Incoming Faxes to Email 
This short and simple guide will show how you can use the SignalWire Python SDK and the MailGun API in order to forward your incoming SignalWire faxes to email. 
You can easily bridge this older technology by allowing faxes to be delivered to your inbox with only a few lines of code.

## Configuring the main script 

We start with the necessary imports and instantiate a Flask app:
```python
import os
import requests
import pprint

from flask import Flask, request

app = Flask(__name__)
```

Next, we need to define a function that will use the MailGun API to send the email. You can read more about sending with the MailGun API in their documentation here: [https://documentation.mailgun.com/en/latest/quickstart-sending.html](https://documentation.mailgun.com/en/latest/quickstart-sending.html)

This function is very simple and copied exactly from their documentation - no need to make any difficult changes! Set up the API token, from address, to address, and subject line in your `.env` file. We will show how to set that up further down in the guide! The body will be passed in as a variable to the function when an incoming fax is received and the webhook is used. 

```python
def send_email(body):
    return requests.post(
        "https://api.mailgun.net/v3/" + os.environ['MAILGUN_DOMAIN'] + "/messages",
        auth=("api", os.environ['MAILGUN_API_TOKEN']),
        data={"from": os.environ['EMAIL_FROM'],
              "to": [os.environ['EMAIL_TO']],
              "subject": os.environ['EMAIL_SUBJECT'],
              "text": body})
```

We also need to define the route we will be using to accept incoming GET/POST requests. In this route, we will call our `send_email` function created above with the formatted form data in the fax as the body. We will then return "200" signify it was successful. 

```python 
@app.route('/fax-webhook', methods=['POST'])
def fax_webhook():
    send_email(pprint.pformat(request.form, indent=4))
    return "200"
```    

Finally, we run the application:

```python
if __name__ == "__main__":
    app.run()
```


## Configuring Your Enviroment File

1. Copy from example.env and fill in your values
2. Save new file callled .env

Your file should look something like this
```
## This is the full name of your SignalWire Space. e.g.: example.signalwire.com
SIGNALWIRE_SPACE=
# Your Project ID - you can find it on the `API` page in your Dashboard.
SIGNALWIRE_PROJECT=
# Your API token - you can generate one on the `API` page in your Dashboard
SIGNALWIRE_TOKEN=
# The phone number you'll be using for this Snippets. Must include the `+1` , e$
SIGNALWIRE_NUMBER=
# MailGun domain associated with your MailGun account
MAILGUN_DOMAIN=
# MailGun token associated with your MailGun Account
MAILGUN_API_TOKEN=
# Send Email From Address
EMAIL_FROM=info@yourdomain.com
# Send email To address
EMAIL_TO=youremail@yourdomain.com
# Email subject
EMAIL_SUBJECT=Forward Fax To Email
```


## Build and Run Natively
For Python
```
1. Replace enviroment variables
2. From command line run, python3 app.py
```

## Running the application

You will need the Flask framework and the SignalWire [Python SDK](https://docs.signalwire.com/topics/laml-api/#laml-rest-api-client-libraries-and-sdks-python) downloaded.

To run the application, execute `export FLASK_APP=app.py` then run `flask run`.

## How to use the application 

To use this Script, you need to expose it to the web (either through `ngrok` or by hosting it on a server) and use it as a webhook for handling incoming calls under phone number settings. For example, this is what it looks like if you use an ngrok tunnel to the script. For this script, you would use the given ngrok URL and the `/fax-webhook` route, like this `http://f0032dfdshhdsfkh7.ngrok.io/fax-webhook`

![Screen Shot 2021-04-14 at 3 25 36 PM](https://user-images.githubusercontent.com/58792902/114774311-aca11f00-9d35-11eb-97f1-cae646f056bc.png)


## Testing locally

You may need to use a SSH tunnel for testing this code – we recommend [ngrok](https://ngrok.com/). After starting the tunnel, you can use the URL you receive from `ngrok` in your webhook configuration for your phone number. 

## Sign Up Here

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!
