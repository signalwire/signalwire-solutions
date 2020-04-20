# The LaML REST API

The [LaML REST API](https://docs.signalwire.com/topics/laml-api/#laml-rest-api) is a comprehensive REST API that enables easy management of all aspects of the SignalWire LaML functionality including calls, conferences, messaging and account maintenance.

SignalWire's REST API allows you to manage and modify calls and messages made to or from your SignalWire phone numbers. You also have the ability to retrieve and update your account information, retrieve your entire history of calls, messages, transcriptions, media and more.

An application such as a PBX has the ability to search for and purchase phone numbers, then set their destinations.

This can all be achieved by sending HTTP requests to the SignalWire REST API.

## Getting started with Ruby

For the sake of this post, we will be using the [Ruby library](https://github.com/signalwire/signalwire-ruby) available via Rubygems.

Our SDKs support many languages, and you can find information on each on the [documentation](https://docs.signalwire.com/topics/laml-api/#laml-rest-api-client-libraries-and-sdks) website.

The instructions to get started with Ruby are [here](https://docs.signalwire.com/topics/laml-api/#laml-rest-api-client-libraries-and-sdks-ruby), but all you need for this tutorial is to install the gem.

```shell
gem install signalwire
```

You will also need your space URL, project ID, and API token from your SignalWire dashboard.

![API Credentials](/assets/api_credentials.png)

Initializing the client is then very simple:

{% gist b599978b99239f2f1b60cd12fffe1f52 %}

> As a reminder, when you are doing outbound calling or messaging, you will need to verify your target number first if your account is in trial. The verification form can be found in the dashboard, under `Phone Numbers > Verified`.

## Making a phone call

The first idea we can experiment with is making a phone call to your own number. This could be an example of a reminder call coming from an automated system, or some kind of alert.

We will need three pieces. The first is a LaML bin containing the message we would like to play back. In a complete application, instead of the LaML bin, you would be using your own HTTP endpoint to provide the document.

{% gist 98fa59d893f0f5601ee26462919921a5 %}

Second, you need to have at least one phone number in your SignalWire account, to be used as the caller ID.

The third and final piece is a Ruby file containing the necessary code. I will be repeating the client instantiation code in each block throughout the article so they can be ran stand-alone.

```ruby
require 'signalwire/sdk'
client = Signalwire::REST::Client.new 'your-project', 'your-token', signalwire_space_url: "example.signalwire.com"

call = client.calls.create(
  url:  'http://YOURSPACE.signalwire.com/YOUR-LAML-BIN-ID',
  to:   '+1555001122333', # This needs to be your destination number, verified if in trial
  from: '+15559988777' # This is one phone number from your SignalWire account
)

puts call.sid
```

Run your Ruby code and listen to the reminder!

```
ruby call.rb
```

## Sending a text message or MMS

In much the same fashion, it is very easy to send out a text message or an MMS to a phone number. 

```ruby
require 'signalwire/sdk'
client = Signalwire::REST::Client.new 'your-project', 'your-token', signalwire_space_url: "example.signalwire.com"

message = client.messages.create(
  to:   '+1555001122333', # This needs to be your destination number, verified if in trial
  from: '+15559988777' # This is one phone number from your SignalWire account
  body: 'Hello from SignalWire'
)

puts message.inspect # not necessary, just taking a peek
```

To attach a media file to a message, simply specify a `media_url` parameter, pointing at a file available via HTTP. The size limit is currently 0.5Mb and the list of accepted MIME types can be found [here](https://docs.signalwire.com/topics/laml-xml/#messaging-laml-overview-mime-types).

```ruby
require 'signalwire/sdk'
client = Signalwire::REST::Client.new 'your-project', 'your-token', signalwire_space_url: "example.signalwire.com"

mms = client.messages.create(
  to:   '+15550011222',
  from: '+15559988777'
  body: 'Here is a photo from my holidays',
  media_url: 'https://SOME-EXAMPLE-URL'
)

puts mms.inspect
```

## Sending a fax

To send a fax, just use the client in a very similar way to an MMS. In this case, we will include a `status_callback` URL to introduce that concept.

```ruby
require 'signalwire/sdk'
client = Signalwire::REST::Client.new 'your-project', 'your-token', signalwire_space_url: "example.signalwire.com"

fax = client.fax.faxes.create( # syntax is a little tricky here due to namespacing
  to:   '+1555001122333',
  from: '+15559988777'
  media_url: 'https://SOME-EXAMPLE-URL/document.pdf',
  status_callback: 'https://YOUR-APPLICATION-URL/CALLBACK-PATH'
)

puts fax.inspect
```

### Using status callbacks

All of the above requests can specify a `status_callback` URL as part of the parameters. If provided, SignalWire will send a POST request to that URL every time the status of the action being performed changes.

For example, when sending a fax, the endpoint will receive form encoded parameters with how many pages have been sent so far, a status code such as `sending` and any errors that present themselves. It would be then easy to update a UI with information on the fax processing.

## Listing usage

The last example we are going to look at is how to list the calls that have been made on your project. This could be useful for billing or just for your internal reference.

```ruby
require 'signalwire/sdk'
client = Signalwire::REST::Client.new 'your-project', 'your-token', signalwire_space_url: "example.signalwire.com"

calls = client.calls.list

calls.each do |record|
  puts record.inspect # prints information about each call
end
```

## Conclusions

There are many more things you can achieve using the LaML REST API, such as listing and buying phone numbers, but we will leave those for our PBX functionality series of posts.

Built something exciting with LaML and SignalWire? Let us know!