# How to Redirect Calls based on Preset Business Hours 
This short and sweet application will show you how you can use time intervals in order to perform one action during business hours and another action outside of business hours. For the sake of this example, we will keep it simple and show how you could dial two different numbers depending on the time. However, you could easily replace the code in the open and closed routes with your own call flow depending on what your needs are. 

## Configuring the code

We start with the necessary imports and instantiate a Flask app:

```python
from flask import Flask
from signalwire.voice_response import VoiceResponse, Dial
from datetime import datetime
from pytz import timezone

app = Flask(__name__)
```

Next, we need to create a route for handling calls during business hours and a route for handling calls outside of business hours. These two routes are essentially identical, so they will both be showed together below! In these routes, we instantiate `VoiceResponse()` as `response` and then start a `dial` with `record=true`. This will make sure that the call will start recording once connected. Next, we use `dial.number()` to input the phone number that we would like to route to. We will dial `+12342556182` when our business is open and `+13373820859` when our business is closed. These numbers will play a simple message such as "We are closed" or "We are open". Feel free to test this application by dialing them yourself! 

```python

@app.route('/open', methods=['GET', 'POST'])
def inBusinessHours():
    response = VoiceResponse()
    dial = Dial(record='true')
    dial.number('+12342556182')
    response.append(dial)
    return response.to_xml()

@app.route('/closed', methods=['GET', 'POST'])
def offBusinessHours():
    response = VoiceResponse()
    dial = Dial(record='true')
    dial.number('+13373820859')
    response.append(dial)
    return response.to_xml()
 ```
 Next, we need to create a route that will respond to incoming calls and check the current time. We instantiate `VoiceResponse()` first just as we did in the previous route. We will define the timezone here as `US/Eastern`, however, you can change this timezone to whichever one you prefer. You can view the list of Pytz timezones here: [https://gist.github.com/heyalexej/8bf688fd67d7199be4a1682b3eec7568](https://gist.github.com/heyalexej/8bf688fd67d7199be4a1682b3eec7568)
 
We can use `datetime.now()` to get a datetime object at the time of the call, and use `tz` as the argument to make sure it's the correct time zone. 
Next, we create two more datetime objects to represent opening and closing time (9AM and 8PM respectively here). The year, month, and date don't actually matter here - we will only be using the time component of these objects. 

Now we use the time component of `timeNow` to see if it's later than `opening` Time and earlier than `closing` Time. If the current time is between business hours, we will move on to the next check to see if the day of the week is also between Monday and Friday. We can use the `datetime.isoweekday()` functionality to see what day of week we are and compare this to a range of Monday - Friday. If both of these conditions are satisfied, we will use use `<Redirect>` to go to the Open route and dial the 'We're Open' number. 

If either of the conditions are not satisfied (9AM-8PM Est and M-F), we will go to the else block and use `<Redirect>` to go to the Closed route and dial the 'We're Closed' number. 
 
 ```python

@app.route('/checkTime', methods=['GET', 'POST'])
def checkTime():
    response = VoiceResponse()
    tz = timezone('US/Eastern')
    timeNow = datetime.now(tz)

    opening = datetime(2010, 1, 1, 9, 0, 0)  # 9AM
    closing = datetime(2010, 1, 1, 20, 0, 0)  # 8PM

    # check if between hours of 9AM-8PM
    if opening.time() < timeNow.time() < closing.time():
        # check if M-F
        if timeNow.isoweekday() in range(1, 6):
            response.redirect(url='/open')
            print('Time Now is: ' + str(timeNow.time()))
            print("That means we're open!")
    else:
        response.redirect(url='/closed')
        print('Time Now is: ' + str(timeNow.time()))
        print("That means we're closed!")

    return response.to_xml()
```

Finally, we run the application:

```python
if __name__ == "__main__":
    app.run()
```

## Running the application

You will need the Flask framework and the SignalWire [Python SDK](https://docs.signalwire.com/topics/laml-api/#laml-rest-api-client-libraries-and-sdks-python) downloaded.

To run the application, execute `export FLASK_APP=app.py` then run `flask run`.

## How to use the application 

To use this Script, you need to expose it to the web (either through `ngrok` or by hosting it on a server) and use it as a webhook for handling incoming calls under phone number settings. For example, this is what it looks like if you use an ngrok tunnel to the script. For this script, you would use the given ngrok URL and the `checkTime` route, like this `http://f0032dfdshhdsfkh7.ngrok.io/checkTime`

![Screen Shot 2021-04-14 at 3 25 36 PM](https://user-images.githubusercontent.com/58792902/114774311-aca11f00-9d35-11eb-97f1-cae646f056bc.png)


## Testing locally

You may need to use a SSH tunnel for testing this code – we recommend [ngrok](https://ngrok.com/). After starting the tunnel, you can use the URL you receive from `ngrok` in your webhook configuration for your phone number. 

## Sign Up Here

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!
