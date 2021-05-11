# How to Build a Dynamic IVR using JSON Menus 
This code will show you how you can use a JSON defined menu in order to easily create an IVR Phone System with Python & Flask. We will be using the SignalWire Team as an example, but you can easily change the verbiage to fit your company needs instead. Once you have modified this script to fit your company and point to the correct agents/departments, you only need to expose the script to the public and attach it as a webhook for handling inbound calls to one of your SignalWire DIDs. 


## Configuring the menus.json file 
In this file, you will need to define the different menus that you would like to rotate through, the different options within each menu, and the verbiage/action to say/take when a particular option is selected. 

In this example, we have four menus: `main`, `sales`, `tech`, and `salesteam`. Each menu has dtmf options (1, 2, or 3) and a verbiage/action associated with each dtmf option. The verbiage specifies what message will be spoken using `<Say>` in the app.py file. The action tells our code which Flask route to redirect and what parameters to pass on to the route. To modify this part to fit your needs, you will need to specify the verbiage you want to use but also change the menu names, parameter names, and the route names. 

```json
{
  "main": {
    "1": {
      "verbiage": "If you'd like to connect to our Sales team, press 1",
      "action": "/get_menu?menu=sales"
    },
    "2": {
      "verbiage": "If you'd like to connect to our Support Engineering Team, press 2",
      "action": "/get_menu?menu=tech"
    }
  },
  "sales": {
    "1": {
      "verbiage": "If you are already a customer and would like to connect to your Account Executive, press 1",
      "action": "/get_menu?menu=salesteam"
    },
    "2": {
      "verbiage": "For assistance with a purchase or all other sales inquiries, press 2",
      "action": "/dial_sales?name=general&group=sales_support"
    }
  },
  "tech": {
    "1": {
      "verbiage": "If you are having a problem with SignalWire Work, press 1",
      "action": "/dial_support?group=work_support"
    },
    "2": {
      "verbiage": "If you are having a problem with SignalWire Cloud, press 2",
      "action": "/dial_support?group=cloud_support"
    },
    "3": {
      "verbiage": "If you are having a problem with SignalWire Stack, press 3",
      "action": "/dial_support?group=stack_support"
    }
  },
  "salesteam": {
    "1": {
      "verbiage": "If you would like to speak to Bob, press 1",
      "action": "/dial_sales?name=bob&group=sale_partners"
    },
    "2": {
      "verbiage": "If you would like to speak to Alice, press 2",
      "action": "/dial_sales?name=alice&group=sale_partners"
    },
    "3": {
      "verbiage": "If you would like to speak to Charlie, press 3",
      "action": "/dial_sales?name=charlie&group=sale_partners"
    }
  }
}

```

## Configuring the main script 

We start with the necessary imports and instantiate a Flask app:

```python
import json
from signalwire.voice_response import VoiceResponse, Say, Gather
from flask import Flask, request

app = Flask(__name__)
```

Before we begin our flask routes, we need to define a few functions that will be used later in the code first. The first function is `choose_voicemail(args)`. In this function, we use a Python dictionary named `switcher` to perform the same functions as a Switch statement in other languages. You can see here that the dictionary keys are the same as the `group` parameter assigned in the JSON menus file. Each key corresponds with a diffent string that we will use to insert into a `response.say()` later in the code. If for some reason the `group` parameter is not defined within the dictionary, `errorOccurred` is called instead, leading to a generic voicemail message. 

```python
def choose_voicemail(args):
    switcher = {
        "sale_partners": "Thank you for calling the SignalWire Sales Team. Your requested Account Executive is "
                         "unavailable at the moment. "
                         "Please leave us a detailed message including your account name, phone number, "
                         "and a description of how we can help. "
                         "A member of our team will reach out as soon as possible. "
                         "The recording will begin after the beep. Press the pound key when finished. "
        ,

        "sales_support": "Thank you for calling the SignalWire Sales Team. We are unavailable to take your call at "
                         "this time. "
                         "Please leave us a detailed message including your name, phone number, "
                         "and the product you are interested in purchasing/learning more about. "
                         "A member of our team will reach out as soon as possible. "
                         "The recording will begin after the beep. Press the pound key when finished. ",

        "work_support": "Thank you for calling the SignalWire Work Support Team. We are unavailable to take your call "
                        "at "
                        "this time. "
                        "Please leave us a detailed message including your name, phone number, "
                        "the name of your SignalWire Work instance, and a description of the issue that you're "
                        "encountering "
                        "A member of our team will reach out as soon as possible. "
                        "The recording will begin after the beep. Press the pound key when finished. ",

        "cloud_support": "Thank you for calling the SignalWire Cloud Support Team. We are unavailable to take your "
                         "call at "
                         "this time. "
                         "Please leave us a detailed message including your name, phone number, "
                         "the name of your Account, SignalWire Space Name, and a description of the issue that you're "
                         "encountering "
                         "A member of our team will reach out as soon as possible. "
                         "The recording will begin after the beep. Press the pound key when finished. ",

        "stack_support": "Thank you for calling the SignalWire Stack Support Team. We are unavailable to take your "
                         "call at "
                         "this time. "
                         "Please leave us a detailed message including your name, phone number, "
                         "the name of your SignalWire Stack Account, and a description of the issue that you're "
                         "encountering "
                         "A member of our team will reach out as soon as possible. "
                         "The recording will begin after the beep. Press the pound key when finished. ",
    }

    errorOccurred = "An error occurred. We could not route to the correct agent. Please record a message with detailed " \
                    "information and we will get back to you as soon as possible. "

    return switcher.get(args, errorOccurred)
```

We need to do the exact same thing with the functions `choose_salesman()` and `choose_support()`, except in this case we will store a phone number as the value instead of a string. In these two functions, the parameters `group` and `name` are passed from the menus.json file. 

```python
# take chosen salespersons name and point to their SignalWire line
def choose_salesman(args):
    switcher = {
        "alice": '+12342186054',

        "bob": '+12342186054',

        "charlie": '+12342186054',

        "general": '+12342186054',
    }
    errorOccurred = "An error occurred. We could not route to the correct agent. Please record a message with detailed " \
                    "information and we will get back to you as soon as possible. "
    return switcher.get(args, errorOccurred)


# take chosen support department and point to their SignalWire line
def choose_support(args):
    switcher = {
        "cloud_support": '+12342186054',

        "stack_support": '+12342186054',

        "work_support": '+12342186054',

    }
    errorOccurred = "An error occurred. We could not route to the correct agent. Please record a message with detailed " \
                    "information and we will get back to you as soon as possible. "
    return switcher.get(args, errorOccurred)
```

You will need to replace the phone numbers above with the correct phone number for each agent or department. However, for the sake of testing easily, you can always use a SignalWire DID with the incoming call handling webhook pointed at a LaML Bin containing the LaML below. This will simulate if the agent/department was busy and therefore unable to answer the phone, so you will redirect to the appropriate voicemail instead. 
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Reject reason="busy" />
</Response>
```


With these functions defined, we can now begin going through the 7 different routes. The first route `/get_menu` accepts web requests from GET or POST. We first need to create an instance of `VoiceResponse()` called `response`. Next, we open `menus.json` and load it as menus. We check to see if there is already a default menu specified, and if not, we route it to the main menu. Next we need to read the `input_type` to determine if the user pressed any digits. If digits were pressed, we need to request the value of the digits pressed and use that to redirect to the correct next menu. If no digits were pressed yet, we will present the menu and loop through the options listed. Lastly, we need to add the menu to `response` and return `str(response`. 

```python
@app.route('/get_menu', methods=['GET', 'POST'])
def get_menu():
    response = VoiceResponse()

    with open('menus.json') as f:
        menus = json.load(f)

    menu = request.values.get("menu")
    if menu not in menus:
        response.say("Thank you for calling SignalWire! Please listen closely to the menu options in order to direct your "
                     "call to the correct department.")
        menu = "main"

    input_type = request.values.get("input_type")

    if input_type == "dtmf":
        # get digits pressed at menu
        digits = request.values.get("Digits")
        input_action = menus[menu][digits]["action"]
        response.redirect(url=input_action)
    else:
        gather = Gather(action='/get_menu' + "?menu=" + menu, input='dtmf', timeout="6", method='GET')

        for key in menus[menu]:
            print(key, '->', menus[menu][key]["verbiage"])
            gather.say(menus[menu][key]["verbiage"])

        response.append(gather)

    return str(response)

```

The corresponding LaML for this depends on the options that you choose, however, below are two possible LaML responses that might occur if you were to listen to the main menu and press 1 to connect to the Sales Team. 

```xml
<?xml version="1.0" encoding="UTF-8"?><Response><Say>Thank you for calling SignalWire! Please listen closely to the options in order to direct your call.</Say><Gather action="/get_menu?menu=main" input="dtmf" method="GET" timeout="3"><Say>If you'd like to connect to our Sales team, press 1</Say><Say>If you'd like to connect to our Support Engineering Team, press 2</Say></Gather></Response>
```

Above is the LaML for the main menu. The input collected was 1, so next we see a `<Redirect>` to the action specified in the menus.json file for pressing 1. 
```xml
<?xml version="1.0" encoding="UTF-8"?><Response><Redirect>/get_menu?menu=sales</Redirect></Response>
```

This moves us to the next menu where you are presented with another option to direct to the right sales department. 
```xml
<?xml version="1.0" encoding="UTF-8"?><Response><Gather action="/get_menu?menu=sales" input="dtmf" method="GET" timeout="3"><Say>If you are already a customer and would like to connect to your Account Executive, press 1</Say><Say>For assistance with a purchase or all other sales inquiries, press 2</Say></Gather></Response>
```

The input collected was 1, so now we move to the last possible Sales menu where you can select a salesmen. This will lead us into our next routes. 
```xml
<?xml version="1.0" encoding="UTF-8"?><Response><Redirect>/get_menu?menu=salesteam</Redirect></Response>
```
```xml
<?xml version="1.0" encoding="UTF-8"?><Response><Gather action="/get_menu?menu=salesteam" input="dtmf" method="GET" timeout="3"><Say>If you would like to speak to Bob, press 1</Say><Say>If you would like to speak to Alice, press 2</Say><Say>If you would like to speak to Charlie, press 3</Say></Gather></Response>
```
```xml
<?xml version="1.0" encoding="UTF-8"?><Response><Redirect>/dial_sales?name=charlie&amp;group=sale_partners</Redirect></Response>
```

Great! As you can see, we selected a specific salesman and now we are being redirected to the route `/dial_sales` with the parameters name and group. For the sake of this demo, I will only show the `/dial_sales` route. However, if you were to select the support option instead, it would take you to `/dial_support` which is nearly identical to `/dial_sales` except fot the fact that instead of passing the parameter `name` to `choose_salesman()`, it passes the parameter `group` to `choose_support()`. In the `/dial_sales` route, we need to first assign the passed `group` nd `name` parameters to a variable so that we can use them. We then create an instance of `VoiceResponse()` called `response`. Next, we need to execute `response.dial`. We call the `choose_salesman()` function with the `name` parameter in order to return the correct number to dial and use an action url pointing to the next route `/handleDialCallStatus` passing our parameter of `group` along again. If the agent answers, the call will be connected. If the agent does not answer, the action url will be executed. Lastly, we return `response` as a string. 

```python 
@app.route('/dial_sales', methods=['GET', 'POST'])
def dial_sales():
    group = request.args.get('group')
    name = request.args.get('name')
    response = VoiceResponse()
    response.dial(choose_salesman(name), action='/handleDialCallStatus?group=' + group, methods=['GET', 'POST'])
    return str(response)

```

The corresponding LaML for this is displayed below. 

```xml
<?xml version="1.0" encoding="UTF-8"?><Response><Dial action="/handleDialCallStatus?group=sale_partners" methods="['GET', 'POST']">+12342186054</Dial></Response>
```

In the next route `/handleDialCallStatus` we take the call status from the previous section. We need to assign the group and status parameters passed to the web request to variables so that we can use them within our code. We also need to again instantiate `VoiceResponse()` as `response`. If the call is answered, nothing happens. If the caller does not answer, we use `<Redirect>` to go to our next route which uses the `group` parameter to send the call to a specific voicemail message based on who they were trying to reach. Lastly, we again return `response` as a string. 
```
@app.route('/handleDialCallStatus', methods=['GET', 'POST'])
def handle_dial():
    group = request.args.get('group')
    status = request.args.get('DialCallStatus')

    response = VoiceResponse()
    if status != 'answered':
        print(status)
        response.redirect(url='/get_voicemail?group=' + group)
    else:
        print(status)
    return str(response)
```

The corresponding LaML for this is displayed below:

```xml
<?xml version="1.0" encoding="UTF-8"?><Response><Redirect>/get_voicemail?group=sale_partners</Redirect></Response>
```

The `<Redirect>` above passes the `group` parameter to our next route called `/get_voicemail`. In this route, we set the `group` parameter equal to a variable so that we can use it to choose the correct voicemail. We again instantiate `VoiceResponse()` as `response`. We now need to execute a `response.say()` in order to play a specific voicemail message. We use `choose_voicemail(group)` in order to return the string that we want to be said out loud to the caller. We then use `response.record()` in order to record a message and on key press `#`, we execute the action url to navigate to our very last route. 

```python
@app.route('/get_voicemail', methods=['GET', 'POST'])
def get_voicemail():
    group = request.args.get('group')
    response = VoiceResponse()
    response.say(choose_voicemail(group))
    response.record(action='/hangup', method='POST', max_length=15, finish_on_key='#')
    return str(response)
```
The corresponding LaML is below: 

```xml
<?xml version="1.0" encoding="UTF-8"?><Response><Say>Thank you for calling the SignalWire Sales Team. We are unavailable to take your call at this time. Please leave us a detailed message including your account name, phone number, and a description of how we can help. A member of our team will reach out as soon as possible. The recording will begin after the beep. Press the pound key when finished. </Say><Record action="/hangup" finishOnKey="#" maxLength="15" method="POST" /></Response>
```

Now we can discuss our final route `/hangup`! This route is very simple. We only need to instantiate `VoiceResponse()`, play a message using `response.say()`, hang up the call using `response.hangup()`, and return `response` as a string. 

```python
@app.route('/hangup', methods=['POST'])
def hangup():
    response = VoiceResponse()
    response.say("Thank you for your message. Goodbye!")
    response.hangup()
    return str(response)
```

Finally, we run the application:

```python
if __name__ == "__main__":
    app.run()
```

## Running the application

You will need the Flask framework and the SignalWire [Python SDK](https://docs.signalwire.com/topics/laml-api/#laml-rest-api-client-libraries-and-sdks-python) downloaded.

To install prerequisites, run `pip install -r requirements.txt`. Using a virtualenv is recommended.

To run the application, execute `export FLASK_APP=app.py` then run `flask run`.

## How to use the application 

To use this IVR, you need to expose the script to the web (either through `ngrok` or by hosting it on a server) and use it as a webhook for handling incoming calls under phone number settings. For example, this is what it looks like if you use an ngrok tunnel to the script. 
![Screen Shot 2021-04-14 at 3 25 36 PM](https://user-images.githubusercontent.com/58792902/114774311-aca11f00-9d35-11eb-97f1-cae646f056bc.png)


## Testing locally

You may need to use a SSH tunnel for testing this code – we recommend [ngrok](https://ngrok.com/). After starting the tunnel, you can use the URL you receive from `ngrok` in your webhook configuration for your phone number. 

## Sign Up Here

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!

