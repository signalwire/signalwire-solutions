# SignalWire Video SDK Introduction

SignalWire's roots have always been in video communications, as our founder Anthony Minessale founded the FreeSWITCH project, one of the most popular open source media servers in the world.

Today, we want to gring that experience and that power to new market with a new release that makes it easy to implement video communication solutions based on the SignalWire platform.

Our demo is a very simple application that will generate a random user name and room, unless you pass them in via GET using respectively the `user` and `room` parameters.

## The SignalWire Video API 

Our video product consists of two different APIs that interact to help you build applications.

The server-side API is a collection of REST endpoints used to create and manage room, and add access tokens to them.

On the client side, the Javascript SDK allows you to build a custom video experience in a simple, standard-based way.

SignalWire Video is built around our unique MCU component. A Multipoint Control Unit (MCU) receives the media from each participant and mixes it into a resulting video stream that is then sent to each person in the room.

That creates a much better experience because no matter what the number of participants each user will always only send one video stream and receive only one.

Beta documentation is [here](https://docs.signalwire.com/topics/api/) and will be updated as new features are added.

## Configuration

Start by copying the `env.example` file to a file named `.env`, and fill in the necessary information.

The application needs a SignalWire API token. You can sign up [here](https://signalwire.com/signup), then put the Project ID and Token in the `.env` file as `SIGNALWIRE_PROJECT_KEY` and `SIGNALWIRE_PROJECT_KEY`, together with you full SignalWire Space URL as `SIGNALWIRE_SPACE`.

If you sign up for the first time, your account will be start in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

## Running the application

If you are running the application with Ruby on your computer, run `bundle install` followed by `bundle exec ruby app.rb` after configuring the `.env` file.

To use the bundled Docker configuration, set up your `.env`, build the container using `docker build . -t swvideo` then run the application with `docker run -it --rm -p 4567:4567 --name swvideo --env-file .env swvideo`.

After starting the process with either of the two methods, head to `http://localhost:4567`.

If you would like to test it with friends and colleagues, we recommend [ngrok](https://ngrok.com/). After starting the tunnel pointed at your port `4567`, you can use the URL you receive from `ngrok` to access the application and to share the link with other participants.

## Application code

On the server side, we have methods to create a room and retrieve a token to access it. Each of your users needs a separate token.

You can find the complete application [here](https://github.com/signalwire/signalwire-guides/tree/master/code/simple_video_example), but what follows is an abstract of how we create a token in Ruby, then how we access the room in the browser.

```ruby
# Request a token with simple capabilities
def request_token(room, user = nil)
  payload = {
    room_name: room,
    user_name: user.nil? ? "user#{rand(1000)}" : user,
    scopes: [
      "room.self.audio_mute",
      "room.self.audio_unmute",
      "room.self.video_mute",
      "room.self.video_unmute"
    ]
  }
  result = api_request(payload, 'room_tokens')
  result['token']
end

# Create a room to join
def create_room(room)
  payload = {
    name: room,
    display_name: room,
    max_participants: 5,
    delete_on_end: false
  }
  api_request(payload, 'rooms')
end
```

On the client side, we simply set up the client to put the video in a root element, and connect.

```js
function connect() {
      VideoSDK.createRTCSession({
        host: host, // allow switch between staging and production
        token: token,
        rootElementId: 'rootElement',
        audio: '1',
        video: '1',
      }).then(rtc => {
        // Make it global
        rtcSession = rtc

        console.debug('Video SDK room', rtcSession)

        rtcSession.on('destroy', (params) => {
          hangup()
        })

      // extra handlers removed for legibility. Check the application code for more examples.

      rtcSession.join()
    })
  }
  ```

## Sign Up Here

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!