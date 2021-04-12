# How to Forward Recording Transcriptions to SMS

This code snippet uses the `transcription callback` parameter in order to send a transcription of the created recording via SMS. When a recording is created with transcription enabled and the transcription callback pointing to this script, a SignalWire client object will be created and used to send the message to the end destination cell phone. 

We start with the necessary imports and instantiate a Flask app:

```python
from flask import Flask, request
from signalwire.rest import Client as signalwire_client

app = Flask(__name__)
```

This script is short and simple. There is only one route in this application which we will call `/message`. Here, we need to use `request.form.get('ParameterName')`
in order to gather the `CallSid`, `TranscriptionText`, and `From` number parameters and store them in their own variables. If you want to include more parameters either to print to console or include in the message, you can gather them using the same format here. 

We then create a SignalWire client object with our project details and authentication. All that's left there is to create a message object and send all of the necessary information within the `Body` with the `To` number being the end destination number and the `From` number being a SignalWire number. 

```python
@app.route("/message", methods=["POST"])
def message():
    # gather necessary paramters and store them in an accessible variable 
    call_sid = request.form.get('CallSid')
    transcription_text = request.form.get('TranscriptionText')
    from_number = request.form.get('From')

    # create a client object connected to our account & project
    client = signalwire_client("ProjectID", "AuthToken", signalwire_space_url = 'YOURSPACE.signalwire.com')

    # create a text message and the text with necessary parameters 
    m = client.messages.create(
        body='You have received a voicemail from the number ' + from_number +
             '. The voicemail transcription is as follows: "' + transcription_text +
             '" and the Call SID is ' + call_sid,
        from_='+1xxxxxxxxxx',
        to='+1xxxxxxxxxx'
    )
    return transcription_text
```

Finally, we run the application:

```python
if __name__ == "__main__":
    app.run()
```

## Running the application

You will need the Flask framework and the SignalWire [Python SDK](https://docs.signalwire.com/topics/laml-api/#laml-rest-api-client-libraries-and-sdks-python) downloaded.

To install prerequisites, run `pip install -r requirements.txt`. Using a virtualenv is recommended.

To run the application, execute `export FLASK_APP=transcription_to_text.py` then run `flask run`.

## Configuring the application

There are a number of different ways to configure this application, with the **key** point being that you **MUST** have transcription enabled and transcribe callback set to a webhook pointing at this script. We recommend using `ngrok` as a tunnel for testing if you don't want to host this script on a server somewhere.

The example below shows a potential LaML bin that could be attached to a phone number to record and transcribe a voicemail. The `transcribe callback` parameter in this example uses an `ngrok` tunnel in order to access the script running on port 5000. 


```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>
        Please leave a message at the beep.
        Press the pound key when finished.
    </Say>
    <Record
        action="http://your-application.com/handleRecording.php"
        maxLength="15"
        finishOnKey="#"
        transcribe="true" 
        transcribeCallback="http://068374s8127.ngrok.io/message"
        />
</Response>
```

## Testing locally

You may need to use a SSH tunnel for testing this code – we recommend [ngrok](https://ngrok.com/). After starting the tunnel, you can use the URL you receive from `ngrok` in your webhook configuration for your phone number.

## Sign Up Here

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!
