# Step-by-step Video SDK Demo with Python

SignalWire Video APIs allow you to host real-time video calls and video conferences on your website or app. The following demo is a very simple application that will help you get started and embed video. The demo will:

- Generate a **user name** and **room**. The username will be random and the default room will be the main office unless you pass them in as query params via GET using the `user` and `room` parameters, respectively.

- Create two different user types - **guest** and **moderator**, each with different capabilities. Users as a guest will have appropriate [permissions](https://developer.signalwire.com/signalwire-api/reference/video_room_permissions) to control their own audio/video. Users as a moderator will have permissions to control audio/video or other participants as well.

We will use **server side Python** and **client side Javascript** to build an interactive application that can handle calls with multiple users with ease.

Below is a screenshot of the **moderator view**. Notice the controls on the left and at the bottom of the screen:

![Moderator View](assets/moderator_view_2.png)

Below is a screenshot of the **guest view**:

![Guest View](assets/guest_view_2.png)

## SignalWire Video API

SignalWire Communications API consists of two different APIs that interact to help you build applications.

- **Server-side API**: This is a collection of REST endpoints used to create and manage rooms, and add access tokens to [them](https://developer.signalwire.com/signalwire-api/reference/list_rooms).

- **Client side API**: The Javascript SDK allows you to build a custom video experience in a simple, standard-based [way](https://developer.signalwire.com/signalwire-client-sdks/docs).

Documentation for SignalWire Communications API is available [here](https://docs.signalwire.com/topics/api/)!

## Authenticating your application

The application needs a SignalWire API token. You can sign up [here](https://signalwire.com/signup), then update the .env file with the Project ID as `SIGNALWIRE_PROJECT_KEY`, Auth Token as `SIGNALWIRE_TOKEN`, and SignalWire Space URL as `SIGNALWIRE_SPACE`. You can see an example of this in the script below with made up values.

```
SIGNALWIRE_PROJECT_KEY = '7dafyd8fsd-adfhsdj7asdhdf-fhsdkjs'
SIGNALWIRE_TOKEN = 'PTsjdfsh123hkjdshdfs'
SIGNALWIRE_SPACE = 'example.signalwire.com'
```

## Setting up the server side code

The server side code will do most of the heavy lifting; within this file you will need functions for handling HTTP requests, creating rooms, and creating tokens. You will also need two flask routes that will handle requests to create a ‘guest token’ and to create a ‘moderator token’.

The [create token endpoint](https://developer.signalwire.com/signalwire-api/reference/create_room_token) will return a JWT token that is used by the front end application to identify what actions you are allowed to perform. When a token is created, the most important parameter required is permissions that define what each user is allowed to do. For example, if you gave a user no permission at all, they would be unable to mute or unmute their own audio/video.

_In this example_, we will need 3 functions:

- **First**, a function to create a guest token that will define permissions that will only allow a user to control their own audio and video.
- **Second**, a function to create a moderator token, which will allow a user to control not only their own audio/video but also the audio/video of other individual members, everyone in the room at the same time, or even to kick a user out of the room.
- **Third**, a function to create a room.

**Our first function** will define what happens when a token with guest permissions is requested. We will create a dictionary called `payload` with keys `room_name` and `user_name`. Both of these values can be passed through the URL as query params, but if `user` is not specified as a query parameter, it will be randomized. We also need to create an array that will contain [permissions](https://developer.signalwire.com/signalwire-api/reference/video_room_permissions) to control only one's own video/audio. We will add a dictionary key of permissions and set it equal to our permissions array. Next, we will set `result` equal to the result of our function `handle_http()` with the arguments `payload`, which has our room name, user name, and permissions, and `room_tokens`, which is the correct endpoint for creating a token.

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

**Our second function** will define what happens when a token with moderator permissions is requested. This function is nearly identical to the previous function where we request a token with guest permissions in terms of the structure. The only difference is that we have extra permissions in this function that guests are not given. In this demo, a moderator will be able to video mute/ummute other users, audio mute/unmute other users, mute/unmute all members in the room at the same time, and kick other users out.

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

**Our third function** will be responsible for [creating the room](https://developer.signalwire.com/signalwire-api/reference/create_room) when called and it's very simple!

We will create a dictionary called `payload` just like the previous functions. This dictionary will have keys `name`, `display_name`, `max_participants`. We will then return the result of our `handle_http()` method with arguments `payload` as the payload and `rooms` as the endpoint for creating a room.

```python
def create_room(room):
	payload = {
    	'name': room,
    	'display_name': room,
    	'max_participants': 5
	}

	return handle_http(payload, 'rooms')
```

Next, we need to define our two routes for moderator and guest users.

**Let's start with the moderator route.** We will begin by setting the `defaultRoom` for instances when a custom room is not chosen. We will also set the `userType` to a moderator. However, we don't want users not having options for customization! We will accept query params for room and user to allow for specific rooms and users to be chosen.

An example of how this would look is `https://localhost?room=Reception?user=Receptionist`. We will then call our `createRoom()` function in order to create the room. Next, we will assign the value of running our function `request_moderator_token()` with arguments `room` and `user` that were defined earlier in the function to `moderatorToken`. Now we will render the bootstrap template with our values for `room`, `user`, `token`, `space`, `userType`, and `logo`.
rce page](https://signalwire.com/resources/getting-started/trial-mode).

**The guest route** This will be identical to the route above except that we will call the `request_guest_token()` function instead and set `userType` to something other than `Moderator` to indicate that this user does not have full permissions. In this example, I will use `Regular User`. You will also need to pass the `guest.html` file as the variable instead of `mod.html`.

## Configuring the client side code

Now that we have created a room and assigned tokens, we need to control what the user sees when they join the room! There are two different files that contain [Bootstrap](https://getbootstrap.com/) templates for what the layout should look like and Javascript to control how the user can interact with the page. The `guest.html` view does not include any buttons for moderator controls, such as ‘Mute All Users’ or ‘Remove a Participant’. It will only contain the buttons to mute and unmute a participant’s own individual audio/video. The `mod.html` file represents what a moderator sees, so they will have the buttons to control each user as well as themselves.

See the `mod.html` or `guest.html` file for the full code. You are free to change the layout to anything you'd like.

To summarize, we simply pass the id of the HTML element where we want the SDK to place the video in `rootElementId`. In our case, our element is named rootElement and we are passing it to rootElementId. Host and token will point to the host and token variables passed through the Bootstrap template in our previously defined guest and moderator route.

Here you can see that audio and video are both set to true. This is what determines the application will be connecting with both audio and video. If you wanted to create an audio-only application (like a clubhouse style app), you could set the video here to “false” and you would use the audio track only.

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

### Event Handling

The last noteworthy part of the javascript code is the steps that are taken when a room is joined (and when a member joins/leaves). The full code can be found in either `mod.html` or `guest.html`; below is a display of what happens when a room is joined. The same concept is true for when a member joins/leaves except that it is not necessary to indicate the specific user as there is only one in the `params.room` object at that time.

The SDK emits events to let the client know about various salient changes (like when a participant joins or leaves or when a participant's state changes as in their video is muted or unmuted). You can see an example of how we get the events here:

```
rtcSession.on("room.joined", (params) => {
// do something here
})
```

When a room is joined, as long as the user does not already exist, we create an object called `participantListObj` with the properties `userId` and `userName`. We will use `params.room.members[participant]` to get the userID and userName for these properties. We will create another object `partObj` where the key is `participantListObj.userId` and is equal to the object `participantListObj`.
Lastly, we will push `partObj` to our globally declared `participantList` array.

What this results in is the following:

`participantList` = an array of participant objects.
`participantListObj` = an object with properties `userId` and `userName`.
`partObj` = an object where `userId` is the key and the value is an object containing `userId` and `userName`.

We will then call our function `listParticipants` to make sure that the list stays updated.`listParticipants` will be discussed in the next section.

```javascript
rtcSession.on("room.joined", (params) => {
  var participant;

  for (
    participant = 0;
    participant < params.room.members.length;
    participant++
  ) {
    if (participantList[params.room.members[participant].id]) {
      console.log("User already exists");
    } else {
      var participantListObj = {
        userId: params.room.members[participant].id,
        userName: params.room.members[participant].name,
      };
      let partObj = {};
      partObj[participantListObj.userId] = participantListObj;
      participantList.push(partObj);
    }
  }

  listParticipants();
});
```

Again, the code is nearly exactly the same when members join or leave except that there is only one member in `params.room.member` so the code would instead look like this:

```
var participantListObj = {userId: params.member.id, userName: params.member.name};
```

### Listing Participants

When you are in a room, it is helpful to be able to see all of the users who are in the room with you. The function `listParticipants()` will list all the current users and if you're a moderator, it will allow you to control them with buttons. `listParticipants()` will be called any time the room is joined and any time a member joins/leaves so that it is always updated.

[Listed Participants](assets/listed_participants.png)

Below is an abridged version with the main points. Here we will go through the participants one by one and list them as an HTML element. In the nav bar (or wherever you'd like participants to be displayed), we need to create a `<li>` element with an id equal to "app". In `listParticipants()`, we will start by creating a ul element called list and selecting the `<li>` element with id app set to the variable app. We will set `app.textContent` to an empty string to make sure that every time it is called, the original list is cleared.

We will loop through our array of participant objects and create a `<li>` element with text content equal to a string like "UserName : User ID" for each user. We will also add buttons for each moderator function (only `videoMute` shown below). We can make the button functional by setting the .onclick event equal to the function we defined earlier, `videoMuteMember(id)` with the participants userID as the id argument. This same process can be repeated for all the other buttons. We then append to list the li element with username and user ID and the buttons to mute/unmute that user, in that order. Lastly, outside of the forEach loop we will append list to app, which will make it appear on our nav bar.

```js
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

### How to Control the Video/Audio of Other Users

In the moderator view, we have several functions for controlling other users shown below. These will take a member ID (gathered from `room.params` on room state changes) as the argument and contain the methods shown in the [documentation](https://developer-docs.signalwire.com/js/latest/classes/video.room.html) for muting/unmuting/kicking out a user. These will not work if the token does not have the correct permission defined. These will be attached as on click events to buttons that are next to each user on the nav bar **only if** you are in the moderator view.

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

## Running the application

To run the application, execute `export FLASK_APP=main.py` then run `flask run`.

To run in a docker container, first build the image with `docker build -t python_video_demo .` then run with `docker run -e SIGNALWIRE_PROJECT_KEY=<YOUR_PROJECT_ID> -e SIGNALWIRE_TOKEN=<YOUR_API_TOKEN> -e SIGNALWIRE_SPACE=<YOUR_SPACE_URL> -p 5000:5000 python_video_demo`. Lastly, access the application by using `localhost:5000`. 


## How to use the application

To use this script locally, test using either the default moderator route, like this `https://localhost?room=Reception?user=Receptionist` or the guest route, like this `https://localhost/guest?room=Cassie`.

To share it with others, host it on a server or use an SSH tunnel along with the appropriate route for who you are sharing it with. For this script, you could use a ngrok URL and either the default moderator route, like this `http://f0032dfdshhdsfkh7.ngrok.io?user=Cassie` or the guest route, like this `http://f0032dfdshhdsfkh7.ngrok.io/guest?user=Cassie`.