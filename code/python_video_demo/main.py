from flask import Flask, request, render_template, jsonify
import requests
import json
import random
from requests.auth import HTTPBasicAuth

app = Flask(__name__)

SIGNALWIRE_PROJECT_KEY = '597f1e39-9fde-47d9-a76a-217ec0e5c8e7'
SIGNALWIRE_TOKEN = 'PT5123f69961b8fa8992f0fb79d4d6c150ce0f18da0c3f671e'
SIGNALWIRE_SPACE = 'bowl-test.signalwire.com'
SIGNALWIRE_HOST = 'relay.signalwire.com'


# handle HTTP requests
def handle_http(payload, endpoint):
    user = SIGNALWIRE_PROJECT_KEY
    passw = SIGNALWIRE_TOKEN

    data = json.dumps(payload)
    print(data)

    response = requests.post("https://" + SIGNALWIRE_SPACE + "/api/video/" + endpoint,
                             data=data,
                             auth=HTTPBasicAuth(user, passw),
                             headers={"Content-Type": "application/json"})
    print(response)
    return json.loads(response.text)


# request regular user token
def request_guest_token(room, user=None):
    payload = dict()
    payload['room_name'] = room
    payload['user_name'] = user if user else "user_" + str(random.randint(1111, 9999))
    permissions = ["room.self.audio_mute",
                   "room.self.audio_unmute",
                   "room.self.video_mute",
                   "room.self.video_unmute"]
    payload['permissions'] = permissions
    result = handle_http(payload, 'room_tokens')
    print('Token is: ' + result['token'])
    return result['token']


# request moderator token with privileges to control other users as well
def request_moderator_token(room, user=None):
    payload = dict()
    payload['room_name'] = room
    payload['user_name'] = user if user else str(random.randint(1111, 9999))
    permissions = ["room.self.audio_mute",
                   "room.self.audio_unmute",
                   "room.self.video_mute",
                   "room.self.video_unmute",
                   "room.member.audio_mute",
                   "room.member.audio_unmute",
                   "room.member.video_mute",
                   "room.member.video_unmute",
                   "room.member.remove",
                   ]
    payload['permissions'] = permissions
    result = handle_http(payload, 'room_tokens')
    print('Token is: ' + result['token'])
    return result['token']


# Create a room to join
def create_room(room):
    payload = {
        'name': room,
        'display_name': room,
        'max_participants': 5,
        'delete_on_end': False
    }

    return handle_http(payload, 'rooms')


# assign user with moderator privileges (control other users)
@app.route("/", methods=['GET', "POST"])
def assignMod():
    # set default room for when no custom room is chosen
    defaultRoom = 'Main_Office'
    userType = "Moderator"

    # allow users to assign custom rooms by passing parameter for room through form
    if request.args.get('room'):
        room = request.args.get('room')
    else:
        room = defaultRoom

    # allow users to assign custom user by passing parameter for user through form
    if request.args.get('user'):
        user = request.args.get('user')
    else:
        user = "user_" + str(random.randint(1, 100))

    create_room(room)
    moderatorToken = request_moderator_token(room, user)

    return render_template('mod.html', room=room, user=user, token=moderatorToken, logo='/static/translogo.png',
                           host=SIGNALWIRE_HOST, userType=userType)


# assign guest role - no ability to control other users
@app.route("/guest", methods=['GET', "POST"])
def assignGuest():
    # set default room for when no custom room is chosen
    defaultRoom = 'Main_Office'
    userType = "Regular User"

    # allow users to assign custom rooms by passing parameter for room through form
    if request.args.get('room'):
        room = request.args.get('room')
    else:
        room = defaultRoom

    # allow users to assign custom user by passing parameter for user through form
    if request.args.get('user'):
        user = request.args.get('user')
    else:
        user = "user_" + str(random.randint(1, 100))

    create_room(room)
    guestToken = request_guest_token(room, user)

    return render_template('guest.html', room=room, user=user, token=guestToken, logo='/static/translogo.png',
                           host=SIGNALWIRE_HOST, userType=userType)


if __name__ == "__main__":
    app.run(debug=True)
