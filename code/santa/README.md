# The SignalWire Santa Relay Bot!

![Ho ho ho!](/assets/santa/santa.gif)

The festivities are upon us! In this holiday season, we have created a Relay bot for you to play with!

The SignalWire Santa Bot will ask you if you have been nice, and what you would like as a present... but beware! No profanities are tolerated!

It demonstrated how easy it is to use Relay to share logic between multiple channels, in this case voice and text.

## Running the app (around the Christmas tree)

First of all, run `bundle install` to set up the necessary gems.

Then, head to you SignalWire dashboard and grab an API key.

![API Credentials](/assets/api_credentials.png)

You will also need a phone number, which we will set up in just a minute.

In your phone number settings, select `Relay` as the handler (both for voice and messaging) and set `santa` as the context.

![Relay context](/assets/santa/set-context.png)

Next, copy `.env.example` to `.env` and edit the file, adding your API keys, the phone number you set up, and making sure it is using the same context as you indicated in the previous step.

Finally, run `ruby santa_consumer.rb` and call or text your phone number. Can you hear the bells jingle?

## To all of our friends, we wish a Merry Christmas and a fantastic New Year, where we will shape the future of communications together!