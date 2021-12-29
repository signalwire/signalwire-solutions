import os
import slack
import re
from dotenv import load_dotenv
from flask import Flask, request, Response
from signalwire.rest import Client as signalwire_client
from twilio.twiml.messaging_response import MessagingResponse

load_dotenv()
app = Flask(__name__)

# Declare our Slack and SignalWire
slack_token =os.getenv("SLACK_BOT_TOKEN")
slack_client = slack.WebClient(slack_token)
client = signalwire_client(os.getenv("SIGNALWIRE_PROJ_ID"),os.getenv("SIGNALWIRE_API_TOKEN"),signalwire_space_url = os.getenv('SIGNALWIRE_SPACE_URL'))



@app.route('/signalwire', methods=['POST'])
def signalwire_to_slack_flow():
    from_number = request.form['From']
    sms_message = request.form['Body']
    message = f"Text message from {from_number}: {sms_message}"
    slack_message = slack_client.chat_postMessage(
        channel='#signalwire_conversations', text=message, icon_emoji=':robot_face:')
    response = MessagingResponse()
    return Response(response.to_xml(), mimetype="text/html"), 200

@app.route('/slack', methods=['POST'])
def slack_to_signalwire_flow():
    attributes = request.get_json()
    if 'challenge' in attributes:
        return Response(attributes['challenge'], mimetype="text/plain")
    incoming_slack_message_id, slack_message, channel = parse_message(attributes)
    if incoming_slack_message_id and slack_message:
        to_number = get_customer_number(incoming_slack_message_id, channel)
        if to_number:
            to_number = '+' + to_number
            messages = client.messages.create(
                to=to_number, from_=os.getenv("SIGNALWIRE_NUMBER"), body=slack_message)
        return Response(), 200
    return Response(), 200

def parse_message(attributes):
    if 'event' in attributes and 'thread_ts' in attributes['event']:
        return attributes['event']['thread_ts'], attributes['event']['text'], attributes['event']['channel']
    return None, None, None

def get_customer_number(incoming_slack_message_id, channel):
    data = slack_client.conversations_history(channel=channel, latest=incoming_slack_message_id, limit=1, inclusive=1)
    if 'subtype' in data['messages'][0] and data['messages'][0]['subtype'] == 'bot_message':
        text = data['messages'][0]['text']
        phone_number = pull_number_from_slack_message(text)
        return phone_number
    return None

def pull_number_from_slack_message(text):
    data = re.findall(r'\w+', text)
    if len(data) >= 4:
        return data[3]
    return None

if __name__ == '__main__':
    app.run( port=5050)