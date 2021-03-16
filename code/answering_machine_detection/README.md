# Answering Machine Detection
This guide utilizes Answering Machine Detection to determine whether a human or voicemail machine has picked up the phone so that it can either dial a number to connect someone to the human or leave a message for the voicemail box. 

When a call is initiated with ```machine_detection``` set to ```DetectMessageEnd```, there is a parameter posted to the webhook called AnsweredBy. The potential options here are machine_end_other, machine_end_beep, machine_end_silence, and human. If the parameter returned is anything other than human, this example will take a short pause to wait for the beep and then play a message for the intended recipient. If the parameter returned is human, it will dial a number to connect the human to another person.

We start with the necessary imports below and set the port to 8080. 

```ruby
require 'rubygems'
require 'sinatra'
require 'signalwire'

set :port, 8080
```

Here we create a route for Sinatra and initialize response as a VoiceResponse object so that we can use Say, Dial, Hangup, and Pause. 


```ruby
post '/start' do
  response = Signalwire::Sdk::VoiceResponse.new
```

Now we use a switch statement to designate that we will take different actions depending on the value of ```[:AnsweredBy]```. You can see below that if anything other than human is returned, this code will output "It's a machine", take a brief pause to allow the voicemail system time to reach the recording beep, leave a voicemail for the intended recipient, and hang up. If the value returned is human, this code will output "We got ourselves a live human here!" and then dial the number of your agent (or the next part of your standard call flow). In the dial, you have the option to either hard code the number you would like to dial or use environment variables. 


```ruby
case params[:AnsweredBy]
  when 'machine_end_other', 'machine_end_silence', 'machine_end_beep'
    puts "It's a machine!"
    # put in a little pause to allow the recording to start on the other end
    response.pause(length: 1)
    # replace messsage with whatever voicemail you want to leave
    response.say(message: "Hello! This is the County Medical Center. We are calling you to confirm your doctor appointment. Please call us back as soon as possible.")
    response.hangup
  when 'human'
    puts "We got ourselves a live human here!"
    response.dial do |dial|
      # defaulting to calling a time voice announcement number as an example
      dial.number(ENV.fetch('AGENT_NUMBER', '+12027621401'))
    end
  end
```

Lastly, we need to put in code for the sake of debugging the LaML. LaML requires that proper XML is returned or it will not work correctly. 
```ruby
  puts response.to_s
  response.to_s
```

## Triggering calls
Below are two different ways that you could initiate the call with machine detection on. In the first, you can use environment variables and the Ruby SDK to initiate your call. The second is an example of how you can run a cURL command in your terminal in order to instantiate your call. Both are acceptable methods - the key is to make sure that however your call is initiated, you have ```machine_detection: "DetectMessageEnd"``` enabled or it will not work correctly. 

```ruby
client = Signalwire::REST::Client.new ENV['SIGNALWIRE_PROJECT_KEY'], ENV['SIGNALWIRE_TOKEN'], signalwire_space_url: ENV['SIGNALWIRE_SPACE']

  call = client.calls.create(
    url: ENV['APP_DOMAIN'] + '/start',
    to: params[:to],
    from: ENV['FROM_NUMBER'],
    machine_detection: "DetectMessageEnd"
  )
```

```bash
curl https://YOURSPACE.signalwire.com/api/laml/2010-04-01/Accounts/YOUR-PROJECT-ID/Calls.json \
  -X POST \
  --data-urlencode "Url=YOUR-WEBHOOK-URL" \
  --data-urlencode "To=DESTINATION-NUMBER" \
  --data-urlencode "From=CALLER-ID-FROM-SIGNALWIRE-ACCOUNT" \
  --data-urlencode 'MachineDetection=DetectMessageEnd' \
  -u "YOUR-PROJECT-ID:YOUR-TOKEN"
```

## Docker instructions

Copy `env.example` to `.env` and edit.

Build with `docker build . -t rubyamd`

Run with `docker run -it --rm -p 8080:8080 --name rubyamd --env-file .env rubyamd`


## Testing locally

You may need to use a SSH tunnel for testing this code – we recommend [ngrok](https://ngrok.com/). After starting the tunnel, you can use the URL you receive from `ngrok` in your webhook configuration for your phone number.

## Sign Up Here

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!
