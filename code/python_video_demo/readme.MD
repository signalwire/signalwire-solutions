# SignalWire Video SDK Demo with Python

SignalWire's roots have always been in video communications, as our founder Anthony Minessale founded the FreeSWITCH project, one of the most popular open source media servers in the world.

Today, we want to bring that experience and that power to new market with a new release that makes it easy to implement video communication solutions based on the SignalWire platform.

Our demo is a very simple application that will generate a random user name and room, unless you pass them in via GET using respectively the `user` and `room` parameters.

## The SignalWire Video API

Our video product consists of two different APIs that interact to help you build applications.

The server-side API is a collection of REST endpoints used to create and manage room, and add access tokens to them.

On the client side, the Javascript SDK allows you to build a custom video experience in a simple, standard-based way.

SignalWire Video is built around our unique MCU component. A Multipoint Control Unit (MCU) receives the media from each participant and mixes it into a resulting video stream that is then sent to each person in the room.

That creates a much better experience because no matter what the number of participants each user will always only send one video stream and receive only one.

Beta documentation is [here](https://docs.signalwire.com/topics/api/) and will be updated as new features are added.

## Configuring the code

Start by copying the env.example file to a file named .env, and fill in the necessary information.

The application needs a SignalWire API token. You can sign up [here](https://signalwire.com/signup), then update the .env file with the Project ID as `SIGNALWIRE_PROJECT_KEY`, Auth Token as `SIGNALWIRE_TOKEN`, and SignalWire Space URL as `SIGNALWIRE_SPACE`. You can see an example of this in the script below with made up values.

```
SIGNALWIRE_PROJECT_KEY = '7dafyd8fsd-adfhsdj7asdhdf-fhsdkjs'
SIGNALWIRE_TOKEN = 'PTsjdfsh123hkjdshdfs'
SIGNALWIRE_SPACE = 'example.signalwire.com'
```

If you sign up for the first time, your account will be start in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

## Setting up the server side code

First, we need to set up the server side code to create a room and retrieve a token for accessing it. We will need a function for handling http requests, a function to request a guest token (non moderator privlidges), a function to request a moderator token, and a function to create a room. We will need a route that when accessed gives users a moderator token as well as a separate route that gives users a guest token.

We start with the necessary imports and assign values from our `.env` file to our required variables. Do not make any changes to `SIGNALWIRE_HOST`, that is already set to the value that it needs to be!

```python
from flask import Flask, request, render_template, jsonify
import requests
import json
import random
from requests.auth import HTTPBasicAuth
import os

app = Flask(__name__)

SIGNALWIRE_PROJECT_KEY = os.environ['SIGNALWIRE_PROJECT_KEY'];
SIGNALWIRE_TOKEN = os.environ['SIGNALWIRE_TOKEN'];
SIGNALWIRE_SPACE = os.environ['SIGNALWIRE_SPACE'];
SIGNALWIRE_HOST = 'relay.signalwire.com'
```

Given that we will be using HTTP methods, we need to define a function for handling HTTP requests. In this function, `user` is your project ID and `passw` is your authentication token. We will define `data` as the argument `payload` converted to JSON format. We will then use the requests library in order to make a POST request to the SignalWire Video API endpoint by using your specific SignalWire space and the argument `endpoint`, the JSON `payload`, basic authentication using `user` and `passw`, and headers.

```python
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
```

Our next function will define what happens when a regular guest token is requested. We will create a dictionary called `payload` with keys `room_name` and `user_name`. Both of these values can be passed through the URL as query params, but if user is not specified as a query param it will be randomized. We also need to create an array that will contain permissions to control only one's own video/audio. We will add a dictionary key of permissions and set it equal to our permissions array. Next, we will set `result` equal to the result of our `function handle_http()` with the arguments `payload`, which has our room name, user name, and permissions, and `room_tokens`, which is the correct endpoint for creating a token. Lastly, we will return `result['token'] to get the actual token itself.

```python
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
```

Our next function will define what happens when a moderator token is requested. We will create a dictionary called `payload` with keys `room_name` and `user_name`. Both of these values can be passed through the URL as query params, but if user is not specified as a query param it will be randomized. We also need to create an array that will contain permissions to control one's own video/audio as well as the audio/video/status of all other users. In this demo, as a moderator, you will be able to video mute/ummute other users, kick other users, audio mute/unmute other users, and mute/unmute all members in the room at the same time. We will add a dictionary key of permissions and set it equal to our permissions array. Next, we will set `result` equal to the result of our `function handle_http()` with the arguments `payload`, which has our room name, user name, and permissions, and `room_tokens`, which is the correct endpoint for creating a token. Lastly, we will return `result['token'] to get the actual token itself.

```python
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
```

Our last function will be responsible for creating the room when called and it's very simple! We will create a dictionary called `payload` just like the previous functions. This dictionary will have keys `name`, `display_name`, `max_participants`, and `delete_on_end`. We will then return the result of our `handle_http()` method with arguments `payload` as the payload and `rooms` as the endpoint for creating a room.

```python
# Create a room to join
def create_room(room):
    payload = {
        'name': room,
        'display_name': room,
        'max_participants': 5,
        'delete_on_end': False
    }

    return handle_http(payload, 'rooms')
```

Next we need to define our two routes for moderator and guest users. We will start with the moderator route. We will start by setting the `defaultRoom` for when no custom room is chosen. We will also set the `userType` to moderator. However, we don't want users to have no options for customization! We will accept query params for room and user to allow for specific rooms and users to be chosen. An example of how this would look is `https.your_dev_env.ngrok.io?room=Reception?user=Receptionist`. We will then call our `createRoom()` function in order to create the room. Next, we will assign the value of running our function `request_moderator_token()` with arguments `room` and `user` that were defined earlier in the function to `moderatorToken`. Now we will render the bootstrap template with our values for `room`, `user`, `token`, `space`, `userType`, and `logo`.

```python
@app.route("/", methods=['GET', "POST"])
def assignMod():
    defaultRoom = 'Main_Office'
    userType = "Moderator"

    if request.args.get('room'):
        room = request.args.get('room')
    else:
        room = defaultRoom

    if request.args.get('user'):
        user = request.args.get('user')
    else:
        user = "user_" + str(random.randint(1, 100))

    create_room(room)
    moderatorToken = request_moderator_token(room, user)

    return render_template('mod.html', room=room, user=user, token=moderatorToken, logo='/static/transplogo.png',
                           space=SIGNALWIRE_HOST, userType=userType)
```

We will now do the guest route. We will start by setting the `defaultRoom` for when no custom room is chosen. We will also set the `userType` to moderator. Like before, we will accept query params for room and user to allow for specific rooms and users to be chosen. An example of how this would look for this route is `https.your_dev_env.ngrok.io/guest?room=Reception?user=Receptionist`. We will then call our `createRoom()` function in order to create the room. Next, we will assign the value of running our function `request_guest_token()` with arguments `room` and `user` that were defined earlier in the function to `guestToken`. Now we will render the bootstrap template with our values for `room`, `user`, `token`, `space`, `userType`, and `logo`. `logo` is a PNG that exists within the static folder, this can be removed if you prefer not to use this but you will need to remove that from the template in the nav bar as well.

```python
@app.route("/guest", methods=['GET', "POST"])
def assignGuest():
    defaultRoom = 'Main_Office'
    userType = "Regular User"

    if request.args.get('room'):
        room = request.args.get('room')
    else:
        room = defaultRoom

    if request.args.get('user'):
        user = request.args.get('user')
    else:
        user = "user_" + str(random.randint(1, 100))

    create_room(room)
    guestToken = request_guest_token(room, user)

    return render_template('guest.html', room=room, user=user, token=guestToken, logo='/static/transplogo.png',
                           space=SIGNALWIRE_HOST, userType=userType)
```

Finally, we run the application. I prefer to leave `debug=True` as the argument as any changes I make can be reloaded without having to restart the code. However, this is up to you and I will display both options below!

```python
if __name__ == "__main__":
    app.run()


if __name__ == "__main__":
    app.run(debug=True)
```

## Configuring the client side code

The `guest.html` and `mod.html` files are quite long so I will not go through them block by block. However, both files are utilizing bootstrap templates. I will go through the main points of the `<script>` portion instead as you are free to change the layout to anything you'd like. See the `mod.html` or `guest.html` file for the full code.

To summarize, we simply set up the client to put the video in a roort element, and connect.

```js
function connect() {
  console.log(token);
  SignalWire.Video.createRoomObject({
    host: host,
    token: token,
    rootElementId: "rootElement",
    audio: "true",
    video: "true",
  }).then((rtc) => {
    rtcSession = rtc;

    console.debug("Video SDK room", rtcSession);

    rtcSession.on("destroy", (params) => {
      hangup();
    });

    // extra handlers removed for legibility. Check the application code for more examples.

    rtcSession.join();
  });
}
```

A few other noteworth parts of the javascript code include the ability to control other members (in the moderator view only), the listed participants on the nav bar, and the steps taken when a room is joined or a member joins/leaves.

In the moderator view, we have several functions for controlling other users shown below. These will take a member ID as the argument and contain the methods shown in the documentation for muting/unmuting/kicking a user. These will not work if the token does not have the correct permission defined. These will be attached as on click events to buttons that are next to each user on the nav bar **only if** you are in the moderator view.

```js
function videoMuteMember(id) {
  rtcSession.videoMute({ memberId: id });
  console.log("Video Mute Member Pressed");
}

function videoUnmuteMember(id) {
  rtcSession.videoUnmute({ memberId: id });
}

function muteMember(id) {
  rtcSession.audioMute({ memberId: id });
}

function unmuteMember(id) {
  rtcSession.audioUnmute({ memberId: id });
}

function kickUser(id) {
  rtcSession.removeMember({ memberId: id });
}
```

When you are in a room, it is helpful to be able to see all of the users who are in the room with you. We will define a function `listParticipants()` that will list all the current users and if you're a moderator, allow you to control them with buttons. `listParticipants()` will be called any time the room is joined and any time a member joins/leaves so that it is always updated.

The full function is quite long, but I will show an abridged version below with the main points. Here we will go through the participants one by one and list them as a html element. In the nav bar (or wherever you'd like participants to be displayed), we need to create a `<li>` element with an `id` equal to "app". In `listParticipants()`, we will start by creating a `ul` element called `list` and selecting the `<li>`element with id `app` set to the variable `app`. We will set `app.textContent` to an empty string to make sure that every time it is called, the original list is cleared.

We will loop through our array of participant objects and create a `<li>` element with text content equal to a string like "UserName : User ID" for each user. We will also add buttons for each moderator function (only videoMute shown below). We can make the button functional by setting the `.onclick` event equal to the function we defined earlier, `videoMuteMember(id)` with the participants userID as the `id` argument. This same process can be repeated for all the other buttons. We then append to `list` the `li` element with username and user ID and the buttons to mute/unmute that user, in that order. Lastly, outside of the forEach loop we will append `list` to `app`, which will make it appear on our nav bar.

```js
// list all current room participants
function listParticipants() {
  var list = document.createElement("ul");
  var app = document.querySelector("#app");
  app.textContent = "";

  participantList.forEach(function (elem) {
    let sid = Object.keys(elem)[0];
    var userId = elem[sid].userId;

    var li = document.createElement("li");
    li.textContent = elem[sid].userName + " : " + elem[sid].userId;

    var videoMuteBtn = document.createElement("BUTTON");
    videoMuteBtn.innerText = "Mute Video";
    videoMuteBtn.onclick = () => {
      videoMuteMember(userId);
    };

    list.appendChild(li);
    list.appendChild(videoMuteBtn);
  });

  app.appendChild(list);
}
```

The last noteworthy part of the javascript code is the steps taken when a room is joined (and when a member joins/leaves). The full code can be found in either `mod.html` or `guest.html`, but I will display what happens when a room is joined below. The same concept is true for when a member joins/leaves except that it is not necessary to indicate the specific user as there is only one in the `params.room` object at that time.

When the room is joined, we will first declare our iterator `i`. We will create a for loop that will go on as long as the iterator (starting at 0) is less than the number of members in the room. It's important to first check if a user already exists so we don't get duplicate values. While this is unlikely, it's important to always account for error logging!

As long as the user does not already exist, we create an object called `participantListObj` with properties `userId` and `userName`. We will use `params.room.members[i]` to get the userID and userName for these properties. We will create another object `partObj` where the key is `participantListObj.userId` and is equal to the object `participantListObj`.
Lastly, we will push `partObj` to our globally declared `participantList` array.

What this results in is the following:

`participantList` = an array of participant objects.
`participantListObj` = an object with properties `userId` and `userName`.
`partObj` = an object where `userId` is the key and the value is an object containing `userId` and `userName`.

We will then call our function `listParticipants` to make sure that the list stays updated.

```javascript
rtcSession.on("room.joined", (params) => {
  var i;

  for (i = 0; i < params.room.members.length; i++) {
    if (participantList[params.room.members[i].id]) {
      console.log("User already exists");
    } else {
      var participantListObj = {
        userId: params.room.members[i].id,
        userName: params.room.members[i].name,
      };
      let partObj = {};
      partObj[participantListObj.userId] = participantListObj;
      participantList.push(partObj);
    }
  }

  listParticipants();
});
```

Again, the code is nearly exactly the same when members join or leave except that there is only one member in `params.room.member` so the code would instead look like this ` var participantListObj = {userId: params.member.id, userName: params.member.name};`

## Running the application

You will need the Flask framework and the SignalWire [Python SDK](https://docs.signalwire.com/topics/laml-api/#laml-rest-api-client-libraries-and-sdks-python) downloaded.

To run the application, execute `export FLASK_APP=main.py` then run `flask run`.

## How to use the application

To use this script, you need to expose it to the web, either through `ngrok` or by hosting it on a server. For example, this is what it looks like if you use an ngrok tunnel to the script. For this script, you would use the given ngrok URL and either the default moderator route, like this `http://f0032dfdshhdsfkh7.ngrok.io?user=Cassie` or the guest route, like this `http://f0032dfdshhdsfkh7.ngrok.io/guest?user=Cassie`.

Here is a picture of what the moderator view looks like:

INSERT PHOTO

Here is a picture of what the guest view looks like:

INSERT PHOTO

## Testing locally

You may need to use a SSH tunnel for testing this code – we recommend [ngrok](https://ngrok.com/). After starting the tunnel, you can use the URL you receive from `ngrok` in your webhook configuration for your phone number.

## Sign Up Here

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!
