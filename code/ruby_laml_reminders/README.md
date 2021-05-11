# SignalWire Reminder Calls

Call center costs have been rising in the last few years, and the quality of service declines if the providers that are picked are too cheap. Automating simple interactions is a great way to increase revenue and customer satisfaction.

This application demonstrates how easy it is to place a call, accepting both DTMF and text input, and using SignalWire's advanced TTS capabilities to speak dates and times in the correct way. If the user changes their appointment to one of the slots we offer, we will also send them a reminder SMS.

## Configuration

Start by copying the `env.example` file to a file named `.env`, and fill in the necessary information.

The application needs a SignalWire API token. You can sign up [here](https://signalwire.com/signup), then put the Project ID and Token in the `.env` file as `SIGNALWIRE_PROJECT_KEY` and `SIGNALWIRE_PROJECT_KEY`, together with you full SignalWire Space URL as `SIGNALWIRE_SPACE`.

If you sign up for the first time, your account will be start in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

Then, copy the `config.json.example` file to `config.json` and change at least the phone number in the reminder block. You can also edit other values if you would like to test different things.

## Running the application

If you are running the application with Ruby on your computer, run `bundle install` followed by `bundle exec ruby app.rb` after configuring the `.env` file.

To use the bundled Docker configuration, set up your `.env`, build the container using `docker build . -t rubyreminders` then run the application with `docker run -it --rm -p 4567:4567 --name mfaruby --env-file .env rubyreminders`.

After starting the process with either of the two methods, head to `http://localhost:4567` and click on "Confirm".

You may need to use a SSH tunnel for testing this code if running on your local machine. – we recommend [ngrok](https://ngrok.com/). After starting the tunnel, you can use the URL you receive from `ngrok` in the `.env` `APP_DOMAIN` variable.

## Sign Up Here

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!