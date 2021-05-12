# SignalWire Video SDK

This is the first demo of SignalWire's new Video SDK, which has just been released and enables all users to harness the power of our MCU-based video collaboration platform.

It is a very simple application that will generate a random user name and room, unless you pass them in via GET using respectively the `user` and `room` parameters.

Beta documentation is [here](https://docs.signalwire.com/topics/api/).

## Configuration

Start by copying the `env.example` file to a file named `.env`, and fill in the necessary information.

The application needs a SignalWire API token. You can sign up [here](https://signalwire.com/signup), then put the Project ID and Token in the `.env` file as `SIGNALWIRE_PROJECT_KEY` and `SIGNALWIRE_PROJECT_KEY`, together with you full SignalWire Space URL as `SIGNALWIRE_SPACE`.

If you sign up for the first time, your account will be start in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

## Running the application

If you are running the application with Ruby on your computer, run `bundle install` followed by `bundle exec ruby app.rb` after configuring the `.env` file.

To use the bundled Docker configuration, set up your `.env`, build the container using `docker build . -t swvideo` then run the application with `docker run -it --rm -p 4567:4567 --name swvideo --env-file .env swvideo`.

After starting the process with either of the two methods, head to `http://localhost:4567`.

If you would like to test it with friends and colleagues, we recommend [ngrok](https://ngrok.com/). After starting the tunnel pointed at your port `4567`, you can use the URL you receive from `ngrok` to access the application and to share the link with other participants.

## Sign Up Here

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!