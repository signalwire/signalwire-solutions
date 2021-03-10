# Call Screening System (with Python)

This code snippet implements a call screening system based on the concept of a blockList containing offending numbers. 

When a call comes in, the From number will be cross checked with the block list to see if it is one of the blocked numbers. If so, the call will hang up. If the number is not in the block list, the call flow moves on to the next segment. 

In this case, I have redirected to a LaML Bin. However, depending on your needs, this can point at a LaML bin, another webhook, or another part of the code within the same document. 

As you can see below, it is very simple to implement such a call flow with SignalWire and LaML.

We start with the necessary imports amd instantiate a Flask app:

```python
from flask import Flask, request
from signalwire.voice_response import VoiceResponse
import os

app = Flask(__name__)
```

We then define a quick method to fetch the blocked list (this could be a database query or something more involved in a production app):

```python
def get_blocklist():
    # there is a default here you can change if you don't want to use the environment variable
    return os.getenv('BLOCKLIST', '+1555778899').split(',')
```

The only route this application has is where we do the block list check and return the necessary LaML either to redirect or hang up:

```python
@app.route('/check', methods=['POST'])
def check_number():
    response = VoiceResponse()
    from_number = request.form.get('From')
    
    if from_number not in get_blocklist():
        response.redirect(os.environ.get('REDIRECT_PATH', 'https://example.signalwire.com/laml-bins/55ab7685-e9c3-4449-b1f0-07ff083d041e'))

    else:
        response.hangup()

    return response.to_xml()
```

Finally, we run the application:

```python
if __name__ == "__main__":
    app.run()
```

This is an example of what the Python code returns to make the redirect happen.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Redirect>https://example.signalwire.com/laml-bins/55ab7685-e9c3-4449-b1f0-07ff083d041e</Redirect>
</Response>
```
## Running the application

You will need the Flask framework and the SignalWire [Python SDK](https://docs.signalwire.com/topics/laml-api/#laml-rest-api-client-libraries-and-sdks-python) downloaded.

To install prerequisites, run `pip install -r requirements.txt`. Using a virtualenv is recommended.

To run the application, execute `export FLASK_APP=python_call_screening.py` then run `flask run`.

## Configuring the application

To set the block list, you can set the `BLOCKLIST` environment variable to a value of a comma-separated list of numbers. For example:

```bash
export BLOCKLIST=+15554433222,+15559988777
```

If you prefer not to use enviroment variables, you can set an additional number or demo URL as displayed in the code below with the number `+15557778899` or the redirect path [https://example.signalwire.com/laml-bins/55ab7685-e9c3-4449-b1f0-07ff083d041e](https://example.signalwire.com/laml-bins/55ab7685-e9c3-4449-b1f0-07ff083d041e) which points at an example LAML bin that calls a naval clock.

```python
return os.getenv('BLOCK_LIST', '+1555778899').split(',')
```
 
```python
response.redirect(os.environ.get('REDIRECT_PATH', 'https://some_redirect_url'))
```

## Testing locally

You may need to use a SSH tunnel for testing this code – we recommend [ngrok](https://ngrok.com/). After starting the tunnel, you can use the URL you receive from `ngrok` in your webhook configuration for your phone number.

## Sign Up Here

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!
