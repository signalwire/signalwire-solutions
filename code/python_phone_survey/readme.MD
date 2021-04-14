# Use Google Sheets and Python to Create an Outbound/Inbound Phone Survey 

This code will show you how you can use the very simple google sheets API instead of a database to store the results of a phone survey designed in Python. This survey can be attached as a webhook to a phone number for inbound calls or sent outbound as the URL for outbound calls. In this case, we will show how it could be used to create a COVID19 health survey that will gather and append the call SID, from number, to number, and the answers to each question to our google sheet. Before we review and explain the code needed for this task, we first need to set up our Google Sheet as well as the Google Cloud Platform. Don't worry, it's easier than you think! 

## Configuring Google Sheets 
The first step is that we will need to create a google sheet for our results to be sent to. We will use the example Covid_Survey, but the name doesn't matter **AS LONG** as you make sure that the name you use in the survey matches the name you use in your python code. We need to first create headers for the survey in the google sheet form. Alternatively, you can push the headers to the google sheet form yourself in your code if you would like to. However, we want to show the most straightforward and easy way of accomplishing this goal. If you are following our example exactly, your google sheet should look like this. 

<img width="1496" alt="Screen Shot 2021-04-14 at 2 19 47 PM" src="https://user-images.githubusercontent.com/58792902/114766802-7c08b780-9d2c-11eb-8624-dde609518c7a.png">


## Configuring Google Cloud Platform 
Google Cloud Platform is next on the list of things to set up before we can use our Python script. Google Cloud Platform (GCP) offers a myriad of cloud computering services, but in this case what we need is the Google Sheets API so that our Python script can connect with the google sheet and send the necessary information. Sign into Google Cloud Platform with your google account and navigate to the home page. We will first begin by clicking the dropdown menu next to the Google Cloud Platform logo on the left side of the toolbar. On the example of my account that I'm sharing below, you can see the spot you need to click is called CovidSurvey. If you have created a project previously, you might see project name there. 

![Screen Shot 2021-04-14 at 2 24 50 PM](https://user-images.githubusercontent.com/58792902/114767565-6778ef00-9d2d-11eb-9703-9ecfcac9b4f8.png)

Next, click **New Project** in the upper right hand corner of the pop up showing all projects. This will take you to the new project page. In my example, I chose to keep the names synonmous and named mine CovidSurvey. However, you're fully welcome to name this whatever you would like as long as it's something memorable and helpful for you. You can leave the organization as blank as this will not apply to us. Once the project is created, go back to the home page and make sure that your new project is selected in the dropdown that we clicked before. 

Next we need to add Google Drive and the Google Sheets API to this project. You can access all of the potential APIs and tools by clicking the hamburger menu in the upper left corner, hovering over ** APIs & Services, and clicking **Library**. Once you're in the **Library**, you can search for Google Drive in the searchbar. Click Google Drive API, which should be the top result returned. You can then click **Enable** in order to install the API within your project. 

Go back to the **Library** and search Google Sheets in the searchbar again. Click Google Sheets, which should be the top result returned. You can then click **Enable** in order to install the API within your project.

Once complete, go back to the home page and select the hamburger menu in the upper left hand corner again. This time, we need to hover over **APIs & Services** and click **Credentials** instead. Click the blue + button at the top that says **CREATE CREDENTIALS** next to it and choose the option **Help Me Choose**. 

You will need to answer a few questions, which are stated in bold and answered directly below. 

**What API are you using?**
Google Drive API

**Where will you be calling the API from?**
Web server (e.g. node.js, Tomcat) In our case, this will be Flask!

**What data will you be accessing?**
Application Data

**Are you planning to use this API with App Engine or Compute Engine?**
No, I'm not using them. 

We are almost at the very last step!

Next, click **What credentials do I need?** 

This will open the **Create a service account** section. Again, the name is completely up to you, but it's best to keep it consistent so that it doesn't get muddled later on. For service account name in this example, I chose **survey**. Enter your chosen name and press **Create**. 

In the next section, scroll down to the **Project** section under **All Roles** which will display some extra options on the right side. Select **Editor** here.  Make sure to select **JSON** as the key type and select continue. This should trigger a JSON file to be downloaded on your browser. 

Open the JSON file in a text editor and copy whatever the value of the `client_email` key is. Now we need to go back to the Google Sheet that was created, click on the **Share** button, paste the copied email address, assign the role of **Editor** to that email address, and click send! 

That's all there is to it, we're now done with the Google Cloud Platform part of this project! 

## Configuring the Code in Python 
There are two different parts to this code. We will take each section one at a time and explain how they all work. 

## Configuring the script for handling and writing the data to the spreadsheet 
Luckily, this code is quite short! The only purpose of this file is to write the data to our spreadsheet. Now, if you decided to name your spreadsheet something other than Covid_Survey like mine, this is where it could cause a problem. Make sure to replace the last line of this code with the identical name of your spreadsheet or nothing will be updated. 

First, we start with the necesary imports. We also need to make sure that the creds.json file that was downloaded earlier is in the same folder as sheets.py and our main script. This short snippet of code uses the creds.json file in order to verify that we have permission to use this API and update the spreadsheet. 

```python
from oauth2client.service_account import ServiceAccountCredentials
import gspread
import os

scope = ["https://spreadsheets.google.com/feeds","https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name(os.getcwd() + "/creds.json", scope)
client = gspread.authorize(creds)
sheet = client.open("Covid_Survey").sheet1

```

## Configuring the main script for running the survey 

We start with the necessary imports and instantiate a Flask app:

```python
from flask import Flask, request, url_for, Response
from signalwire.voice_response import VoiceResponse
from sheets import sheet

app = Flask(__name__)
app.app_context().push()
```

Next, we create a Python dictionary called answers. This will store each of the calls by using `CallSid` as the key and the array of answers as the value. 
We also need to define a function that will translate our responses into XML, as LaML will not work correctly if you are not returning proper XML. 

```python
answers = dict()


def toXML(resp):
    resp = Response(str(resp))
    resp.headers['Content-Type'] = 'text/xml'
    return resp
```

The first route that we need to create is our welcome route. This is the first thing that a customer will here, and we also append some important data here. 

We need to start first by creating our first entry into our dictionary `answers` with `CallSid` as the key and an empty array as the value. We can then append the actual `CallSid `, `To` number, and `From ` number as our first entries into the array that will be inserted into our spreadsheet at the end of the call. 

We then need to initate response and execute a `<Gather>` that will use `<Say>` to play a welcome message, accept an input, and move to the next route indicated in the `actionUrl`. You can read more about `<Gather>` here: [https://docs.signalwire.com/topics/laml-xml/#voice-laml-gather]() and more about `<Say>` here:  [https://docs.signalwire.com/topics/laml-xml/#voice-laml-say](). 

```python
@app.route('/survey/welcome', methods=['POST'])
def description():
    answers[request.form['CallSid']]=[]
    answers[request.form['CallSid']].append(request.form['CallSid'])
    answers[request.form['CallSid']].append(request.form['To'])
    answers[request.form['CallSid']].append(request.form['From'])

    response = VoiceResponse()
    with response.gather(num_digits=1, action=url_for('question_one'), method='POST') as g:
        g.say(message="Thank you for taking our Covid Health survey before you arrive for your appointment. "
                      "Please press any number to get started.")
        return toXML(response)
```

The corresponding LaML for this segment looks like this: 
```xml
<?xml version="1.0" encoding="UTF-8"?><Response><Gather action="/survey/question_one" method="POST" numDigits="1"><Say>Thank you for taking our Covid Health survey before you arrive for your appointment. Please press any number to get started.</Say></Gather></Response>
```

The next section is very simple! We will again initiate `response`, execute a `<Gather>`, and use `<Say>` to play a message. In this case, we will ask our first question and indicate to the user to press 1 for yes or 2 for no. 

```python
@app.route('/survey/question_one', methods=['POST'])
def question_one():
    response = VoiceResponse()
    with response.gather(num_digits=1, action=url_for('question_two'), method="POST") as g:
        g.say('Question one. In the last 14 days, have you traveled by plane inside or outside of the United States? '
              'Please press 1 for yes or 2 for no.')
        return toXML(response)
```

The corresponding LaML for this segment looks like this: 

```xml
<?xml version="1.0" encoding="UTF-8"?><Response><Gather action="/survey/question_two" method="POST" numDigits="1"><Say>Question one. In the last 14 days, have you traveled by plane inside or outside of the United States? Please press 1 for yes or 2 for no.</Say></Gather></Response>
```

Our `<Gather>` in the previous question expects 1 digit (1 for yes or 2 for no) and sends that to the route indicated in the action URL, which is question two. 
In this next segment, we use `request.form['Digits']` in order to get the digits pressed and record them in `digit`. This will be happening in each of the following questions so that the previous answer can be recorded in our array. We use simple if else logic to indicate that if the answer is 1, we need to append yes and if the answer is 2, we need to append no. It's important to account for errors, so if the user presses anything else, we will append unclear. We then repeat the format from earlier in order to pose our next question. 

```python
@app.route('/survey/question_two', methods=['POST'])
def question_two():
    digit = request.form['Digits']
    if digit == '1':
        answers[request.form['CallSid']].append('Yes')
    elif digit == '2':
        answers[request.form['CallSid']].append('No')
    else:
        answers[request.form['CallSid']].append('Unclear.')
    response = VoiceResponse()
    with response.gather(num_digits=1, action=url_for('question_three'), method="POST") as g:
        g.say('Question two. In the last 14 days, have you been in close contact with someone who had '
              'COVID or has since contracted COVID? Please press 1 for yes or 2 for no. ')
        return toXML(response)
```

The corresponding LaML for the above section looks like this: 

```xml
<?xml version="1.0" encoding="UTF-8"?><Response><Gather action="/survey/question_three" method="POST" numDigits="1"><Say>Question two. In the last 14 days, have you been in close contact with someone who had COVID or has since contracted COVID? Please press 1 for yes or 2 for no. </Say></Gather></Response>
```

As the format of the next three questions is identical, I will share that entire segment of code here without repeating the explanations. We will meet again at the end of the survey, where we change the format slightly. 

```python
@app.route('/survey/question_three', methods=['POST'])
def question_three():
    digit = request.form['Digits']
    if digit == '1':
        answers[request.form['CallSid']].append('Yes')
    elif digit == '2':
        answers[request.form['CallSid']].append('No')
    else:
        answers[request.form['CallSid']].append('Unclear.')
    response = VoiceResponse()
    with response.gather(num_digits=1, action=url_for('question_four'), method="POST") as g:
        g.say('Question three. In the last 14 days, have you taken a COVID test and received a positive result? '
              'Please press 1 for yes or 2 for no.')
        return toXML(response)


@app.route('/survey/question_four', methods=['POST'])
def question_four():
    digit = request.form['Digits']
    if digit == '1':
        answers[request.form['CallSid']].append('Yes')
    elif digit == '2':
        answers[request.form['CallSid']].append('No')
    else:
        answers[request.form['CallSid']].append('Unclear.')
    response = VoiceResponse()
    with response.gather(num_digits=1, action=url_for('question_five'), method="POST") as g:
        g.say('Question four. In the last 14 days, have you experienced any of the following symptoms? '
              'Fever, headache, cough, sore throat, nausea, intestinal upset, loss of taste or smell. '
              'Please press 1 for yes or 2 for no.')
        return toXML(response)


@app.route('/survey/question_five', methods=['POST'])
def question_five():
    digit = request.form['Digits']
    if digit == '1':
        answers[request.form['CallSid']].append('Yes')
    elif digit == '2':
        answers[request.form['CallSid']].append('No')
    else:
        answers[request.form['CallSid']].append('Unclear.')
    response = VoiceResponse()
    with response.gather(num_digits=2, action=url_for('end_survey'), method="POST") as g:
        g.say('Last question. What is your age?')
        return toXML(response)
```

This last section is **slightly** different, but not by much! We will again request the digits pressed, but since we are asking for age and not a yes or no question, we will simply append the digits pressed to our array. This will constitute the last column of our spreadsheet. After that, we finally use `sheets.py` which we imported as `sheet`. We use `sheet.insert_row(answers[request.form['CallSid']], 2)` in order to insert our dictionary value with key `CallSid` into the spreadsheet. We insert it into the second row because the first row contains our headers. We then use `answers.pop(request.form['CallSid'])` to remove the key value pair from our dictionary. Lastly, we play a thank you message for our recipients to thank them for taking our survey! 

```python
@app.route('/survey/end_survey', methods=['POST'])
def end_survey():
    digit = request.form['Digits']
    answers[request.form['CallSid']].append(digit)
    sheet.insert_row(answers[request.form['CallSid']], 2)
    answers.pop(request.form['CallSid'])
    response = VoiceResponse()
    response.say('Thank you for taking this survey. Your responses will be sent to our office. You may press the # key '
                 'at any time in order to end the call. Have a great day!')
    return toXML(response)
```

Finally, we run the application:

```python
if __name__ == "__main__":
    app.run()
```

## Running the application

You will need the Flask framework and the SignalWire [Python SDK](https://docs.signalwire.com/topics/laml-api/#laml-rest-api-client-libraries-and-sdks-python) downloaded.

To install prerequisites, run `pip install -r requirements.txt`. Using a virtualenv is recommended.

To run the application, execute `export FLASK_APP=covid_survey.py` then run `flask run`.

## How to use the application 

You can use this application as both an inbound or outbound survey. If you want to use this as an inbound survey, put the code on an accessible server use a webhook to the script as your webhook for handling incoming calls under phone number settings. For example, this is what it looks like if you use an ngrok tunnel to the script. 
![Screen Shot 2021-04-14 at 3 25 36 PM](https://user-images.githubusercontent.com/58792902/114774311-aca11f00-9d35-11eb-97f1-cae646f056bc.png)

Alternatively, you can send this as an outbound survey as well. You would do that by creating a call normally and using the webhook to this script as the Url, like below: 

```curl
curl https://example.signalwire.com/api/laml/2010-04-01/Accounts/{ProjectSid}/Calls.json \
  -X POST \
  --data-urlencode "Url=http://342jds746afd89.ngrok.io/survey/welcome" \
  --data-urlencode "To=+13105678901" \
  --data-urlencode "From=+13103384645" \
  -u "YourProjectID:YourAuthToken"
  ```

## Testing locally

You may need to use a SSH tunnel for testing this code – we recommend [ngrok](https://ngrok.com/). After starting the tunnel, you can use the URL you receive from `ngrok` in your webhook configuration for your phone number. 

## Sign Up Here

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!

