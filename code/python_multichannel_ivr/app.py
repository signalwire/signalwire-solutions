from flask import Flask, request
from signalwire.messaging_response import MessagingResponse
from signalwire.voice_response import VoiceResponse, Gather, Say, Redirect
app = Flask(__name__)

def get_balance():
  return "$50"

def get_credit_card_due_date():
  return "02/15/2021"

@app.route('/sms', methods=['POST'])
def start_sms():
    request.form.get('Body')
    message_body = request.form.get('Body')

    response = MessagingResponse()
    # this should be an actual database check using the From above
    if (message_body == '1234 balance'):
      response.message('Your balance is: ' + get_balance())
    if (message_body == '1234 credit'):
      response.message('Your credit card is due: ' + get_credit_card_due_date())
    else:
      response.message('Please enter your PIN followed by your command (for example "1234 balance" or "1234 credit"')
    return response.to_xml()

@app.route('/voice', methods=['POST'])
def start_voice():
    response = VoiceResponse()
    speech = request.form.get('SpeechResult')
    digits = request.form.get('Digits')

    print(speech)
    print(digits)

    if (speech == '1234' or digits == '1234'):
      response.redirect('/ask')
    else:
      gather = Gather(input='speech dtmf', timeout=5, num_digits=4)
      gather.say('Please say or enter your PIN')
      response.append(gather)

    return response.to_xml()

@app.route('/ask', methods=['POST'])
def perform_action():
  response = VoiceResponse()
  gather = Gather(input='speech dtmf', timeout=5, num_digits=1, action='/perform')
  gather.say('Say balance or press 1 for your balance,say credit or press 2 for your credit card due date')
  response.append(gather)
  return response.to_xml()

@app.route('/perform', methods=['POST'])
def perform_action():
  response = VoiceResponse()
  speech = request.form.get('SpeechResult')
  digits = request.form.get('Digits')
  replace = ''

  if (speech == 'balance' or digits == '1'):
    response.say('Your balance is: PLACEHOLDER')
    replace = '<say-as interpret-as="currency">' + get_balance() + '</say-as>'
  if (speech == 'credit' or digits == '2'):
    response.say('Your credit card is due: PLACEHOLDER')
    replace = '<say-as interpret-as="date" format="mdy">' + get_credit_card_due_date() + '</say-as>'
  else:
    response.redirect('/ask')
  return response.to_xml().replace('PLACEHOLDER', replace)