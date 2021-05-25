from signalwire.rest import Client as signalwire_client
import pandas as pd

#This sets up a function that takes in your Project ID, API Token, and SignalWire URL space.
client = signalwire_client("YourProjectID", "YourAuthToken", signalwire_space_url = 'example.signalwire.com')

#This creates a global variable for the phone number you wish to log calls and messages from.
phone_number = 'YourPhoneNumber'

#This creates a call via a webhook to the phone number in question.
call = client.calls.create(
    url = 'https://your-application.com/docs/voice.xml'
    to = phone_number
    from_ = 'PhoneNumberToSendMessageFrom'

)

#This takes the messages from a given phone number and turns them into a list. If you wish to log every phone number, simply leave the parentheses blank.
messages = client.messages.list(from_ = phone_number)
data = []
for record in messages:
    data.append((record.from_, record.to, record.body, record.date_sent, record.status, record.sid))

#This takes the calls from a given phone number and turns them into a list. If you wish to log every phone number, simply leave the parentheses blank.
calls = client.calls.list(from_ = phone_number)
for record in calls:
    data.append((record.from_, record.to, record.body, record.date_sent, record.status, record.sid))

#This organizes the data retrieved from SignalWire and makes it more readible by creating columns and rows.
chart = pd.DataFrame(data, columns = ('From', 'To', 'Message Contents', 'Date Sent', 'Status', 'SID'))

#If you wish to delete a specific SID from the list, simply input a SID (or a series of SIDs) here.
new_chart = chart[chart.SID != "SID"]
new_chart = new_chart.reset_index(drop = True)

# This deletes the SID from SignalWire's API.
client.messages('MessageSID').delete()


