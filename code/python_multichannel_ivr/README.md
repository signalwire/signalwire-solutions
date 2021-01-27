# Python Multichannel Banking Helper

To install prerequisites, run `pip install -r requirements.txt`. Using a virtualenv is recommended.

To run the application, execute `export FLASK_APP=app.py` then run `flask run`.

## Connecting to your development application

To test the application with SignalWire while running locally, I recommend using [ngrok](https://ngrok.com/).

The application runs on port `5000` by default.

You can then set up your SignalWire DID to point at `your-ngrok-domain/voice` for voice calls and `your-ngrok-domain/sms` for messaging.