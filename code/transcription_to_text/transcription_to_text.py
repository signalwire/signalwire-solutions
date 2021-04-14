from flask import Flask, request
from signalwire.rest import Client as signalwire_client

app = Flask(__name__)

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

if __name__ == "__main__":
    app.run()
