from flask import Flask, request
from signalwire.voice_response import VoiceResponse
import os

app = Flask(__name__)
blockList = os.environ.get('BLOCK_LIST').split(',')


@app.route('/check', methods=['POST'])
def check_number():
    response = VoiceResponse()
    from_number = request.form.get('From')
    print(from_number)

    if from_number not in blockList:
        response.redirect(os.environ.get('REDIRECT_PATH'))
    else:
        response.hangup()

    return response.to_xml()


if __name__ == "__main__":
    app.run()

