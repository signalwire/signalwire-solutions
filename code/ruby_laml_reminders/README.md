# SignalWire Reminder Calls

Call center costs have been rising in the last few years, and the quality of service declines if the providers that are picked are too cheap. Automating simple interactions is a great way to increase revenue and customer satisfaction.

This application demonstrates how easy it is to place a call, accepting both DTMF and text input, and using SignalWire's advanced TTS capabilities to speak dates and times in the correct way. If the user changes their appointment to one of the slots we offer, we will also send them a reminder SMS.

# Configuration

Start by copying the `env.example` file to a file named `.env`, and fill in the necessary information.

The application needs a SignalWire API token. You can sign up [here](https://signalwire.com/signup), then put the Project ID and Token in the `.env` file as `SIGNALWIRE_PROJECT_KEY` and `SIGNALWIRE_PROJECT_KEY`, together with your full SignalWire Space URL as `SIGNALWIRE_SPACE`. You will also need to set the `APP_DOMAIN` to your server URL or SSH tunnel you'll use to access the code publically. 

Then, copy the `config.json.example` file to `config.json` and change **at least** the phone number in the reminder block. You can also edit other values if you would like to test with multiple customers to 'remind' or different names. 

# Step by Step Code Walkthrough
Now we will go through each of the files and explain how each of the building blocks works together. 

## The config.json file 
The JSON file below contains two arrays of objects, `reminders` and `available`. The `reminders` array contains information about the appointment and the `to` number of the customer to call and remind. The `available` array contains other possible date/time pairs that could be used for customers to reschedule their appointments. Although this JSON file is quite simple, it contains most of the data needed for our **app.rb** file. 
```json
{
    "reminders": [{
      "name": "Mr. Smith",
      "to": "+1xxxxxxxxxx",
      "date": "05/10/2021",
      "time": "10:00AM"
    }],
  
    "available" : [{
      "date": "05/10/2021",
      "time": "11:15AM"
    },
    {
      "date": "06/10/2021",
      "time": "2:30PM"
    }]
  }
```
## app.rb

To begin with, we must create two functions using the [Create Call API](https://developer.signalwire.com/twiml/reference/create_a_call) to place a call to our customer and the [Create Message API](https://developer.signalwire.com/twiml/reference/create_message) to send a message with the reminder in it. 

For our `place_call()` function, we can get the `from` number and the `url` from the ENV file, and we will append `/reminder` to the `url` so that we can direct it to the proper route that we will define further down. The `to` number will be passed through as a parameter and we will get it from the **config.json** file. 
```ruby
def place_call(to_number)
  client = Signalwire::REST::Client.new ENV["SIGNALWIRE_PROJECT_KEY"], ENV["SIGNALWIRE_TOKEN"], signalwire_space_url: ENV["SIGNALWIRE_SPACE"]

  call = client.calls.create(
    url: ENV["APP_DOMAIN"] + "/reminder",
    to: to_number,
    from: ENV["FROM_NUMBER"],
  )
end
```
For our `send_reminder()` function, we will get the `from` number from the ENV file. The `to` number will be passed through as a parameter along with the `body` of the message.
```ruby
def send_reminder(text, to_number)
  client = Signalwire::REST::Client.new ENV["SIGNALWIRE_PROJECT_KEY"], ENV["SIGNALWIRE_TOKEN"], signalwire_space_url: ENV["SIGNALWIRE_SPACE"]

  msg = client.messages.create(
    to: to_number,
    from: ENV["FROM_NUMBER"],
    body: text,
  )
end
```
The last function we need to set up before moving forward is needed to handle reading dates/times that are in a computer-friendly format in a more human-friendly way. In this function, we will take the <Say> object, date, and time as parameters. We will use the <Say> object to compose a sentence where the date is read out loud instead of in a timestamp format. 

```ruby
def say_date_and_time(say_object, date, time)
  say_object.say_as(date, interpretAs: "date", format: "mdy")
  say_object.add_text(" at ")
  say_object.say_as(time, interpretAs: "time", format: "hms12")
end
```
  
 
Great! Now that we have defined all of our necessary functions, we can move on to the three Sinatra routes we will be using. Our first route is the default, `/` , and it will store all of the reminders in the **config.json** file into a variable. Using the **index.erb** file in the GitHub repo, we will populate the data into a simple front-end display. 
```ruby
get "/" do
  @reminders = config["reminders"]
  erb :index
end
  ```

When you click **Confirm** on the page above, the code in **index.erb** redirects to our next route, `/call`.
In this route, we will grab the first object in the reminder array and use the `to` number to pass through as a parameter in our `place_call()` function. 
```ruby
  get "/call" do
  reminder = config["reminders"].first
  place_call(reminder["to"])

  redirect "/"
end
  ```
Next, we have our `/reminder` route. As with any route involving gathering input from the customer, the first thing we need to do is check to see if any digits were pressed or speech results were gathered. Based on the input of the caller, we will either confirm the appointment and hang up or redirect to our route `/choose` which will take care of changing the appointment. 

If no speech result/digits pressed are passed through as parameters, we will assume this is the first time that we are speaking to the customer and play a greeting first. We will then use our `say_date_and_time()` function to read out the appointment time for the customer. We will ask the callee to press 1 to confirm or 2 to reschedule and wait for a speech result or digit to be pressed. 
```ruby
  post "/reminder" do
  puts params

  # set reminder to first element in reminders array from config file
  reminder = config["reminders"].first

  # instantiate voice response
  response = Signalwire::Sdk::VoiceResponse.new

  # check for digits or speech result passed through as http request parameters
  # if speech/digit is 1, confirm appointment and hang up.
  # if speech/digit is 2, redirect to choose route
  # otherwise retry to read out appt and gather confirmation again
  if params["Digits"] || params["SpeechResult"]
    if params["Digits"] == "1" || params["SpeechResult"].match?(/yes/)
      response.say(message: "Thank you for confirming your appointment. Goodbye!")
      response.hangup
    elsif params["Digits"] == "2" || params["SpeechResult"].match?(/no/)
      response.redirect("/choose")
    else
      # we didn't understand
      response.say(message: "Sorry, I could not understand you.")
      response.redirect("/reminder?retry=1")
    end
  else

    # read out hello message to the appointment holder, unless it is a retry in which case we'll repeat the main message only
    response.say(message: "Hello, #{reminder["name"]}") unless params["retry"]
    # read out appointment time by calling our say date and time functiona bove with the date and time from the reminder array
    response.say(message: "We are calling you from the dental clinic to remind you about your appointment on ") do |say|
      say_date_and_time(say, reminder["date"], reminder["time"])
    end

    # gather input, 1 to confirm, 2 to deny
    response.gather(input: "speech dtmf", timeout: 5, num_digits: 1) do |gather|
      message = "Do you confirm that date and time?"
      message += "Press 1 or say yes to confirm, or press 2 or say no to choose another option." if params["retry"] == "1"
      gather.say(message: message)
    end
  end
  # convert response to string as response must return proper XML
  response.to_s
end
  ```
In our final route, we will handle changing an appointment if a customer would like to reschedule. If we have detected digits or speech, we will set `picked` to the correct date based on what the customer input via speech or dtmf. Once the callee has chosen their new date, we will play a short message to read out the new date and then send a reminder text for good measure. 

If no speech or digits are detected, we will assume it's the first time that we've accessed this route and play the callee a list of all of their possible appointment date/time options. We will then use <Gather> to get their input and handle it accordingly. 
```ruby
  # define route in case user presses 2 and doesn't confirm appointment
post "/choose" do

  # set reminder to first element in reminders array from config file
  reminder = config["reminders"].first

  # instantiate voice response
  response = Signalwire::Sdk::VoiceResponse.new

  # set up an array with first word string and second word string as parameters
  words = %w{first second}

  # handles sending reminder text for new appointment if appointment is changed
  if params["Digits"] || params["SpeechResult"]
    picked = nil

    # based on parameters passed, assign one of the available dates to the variable picked
    if params["Digits"] == "1" || params["SpeechResult"].match?(/first/)
      picked = config["available"][0]
    elsif params["Digits"] == "2" || params["SpeechResult"].match?(/second/)
      picked = config["available"][1]
    end

    # if picked was assigned to something, play thank you message and call our say date and time function again to make the format more understandable for the caller
    if picked
      response.say(message: "Thank you! Your new appointment is on ") do |say|
        say_date_and_time(say, picked["date"], picked["time"])
      end

      # call our send reminder function to send a message with the date and time passed through in the body parameter
      send_reminder("Your appointment at the Dental Clinic is on #{picked["date"]} at #{picked["time"]}.", reminder["to"])
    else
      # if we didn't understand
      response.say(message: "Sorry, let's try again.")
      response.redirect("/choose")
    end

    # if no input has been detected, assume caller has not heard prompt and offer to make an appointment
  else
    response.say(message: "Let's pick another appointment for you. ")

    # set up to gather input via dtmf or speech
    response.gather(input: "speech dtmf", timeout: 5, num_digits: 1) do |gather|
      # grab available dates from config.jason file and loop through them offering possible dates/times
      gather.say do |say|
        config["available"].each_with_index do |slot, i|
          say.add_text("press #{i + 1} or say #{words[i]} for")
          say_date_and_time(say, slot["date"], slot["time"])
        end
      end
    end
  end

  # convert response to string as response must return proper XML
  response.to_s
end
  ```
# Running the application

If you are running the application with Ruby on your computer, run `bundle install` followed by `bundle exec ruby app.rb` after configuring the `.env` file.

To use the bundled Docker configuration, set up your `.env`, build the container using `docker build . -t rubyreminders` then run the application with `docker run -it --rm -p 4567:4567 --name mfaruby --env-file .env rubyreminders`.

After starting the process with either of the two methods, head to `http://localhost:4567` and click on "Confirm".

You may need to use a SSH tunnel for testing this code if running on your local machine. – we recommend [ngrok](https://ngrok.com/). You can learn more about how to use ngrok [here](https://developer.signalwire.com/apis/docs/how-to-test-webhooks-with-ngrok). After starting the tunnel, you can use the URL you receive from `ngrok` in the `.env` `APP_DOMAIN` variable.
