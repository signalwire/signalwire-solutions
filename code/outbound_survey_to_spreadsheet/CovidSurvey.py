from flask import *
import os
from signalwire.voice_response import VoiceResponse
from sheets import sheet
from flask_session import Session


app = Flask(__name__)
app.secret_key = os.environ['SECRET_KEY']
SESSION_TYPE = 'filesystem'
app.config.from_object(__name__)
Session(app)

global session


def toXML(resp):
    resp = Response(str(resp))
    resp.headers['Content-Type'] = 'text/xml'
    return resp


@app.route('/survey/description', methods=['POST'])
def description():
    response = VoiceResponse()
    with response.gather(num_digits=1, action=url_for('question_one'), method='POST') as g:
        g.say(message="Thank you for taking our Covid Health survey before you arrive for your appointment. "
                      "Please press any number to get started.")
        return toXML(response)


@app.route('/survey/question_one', methods=['POST'])
def question_one():
    response = VoiceResponse()
    with response.gather(num_digits=1, action=url_for('question_two'), method="POST") as g:
        g.say('Question one. In the last 14 days, have you traveled by plane inside or outside of the United States? '
              'Please press 1 for yes or 2 for no.')
        return toXML(response)


@app.route('/survey/question_two', methods=['POST'])
def question_two():
    digit = request.form['Digits']

    print()
    print("Digits pressed are: " + digit)
    print()

    session['answers'] = []

    if digit == '1':
        session['answers'].append('Yes')
        print("Session is: ")
        print(session)
        print()
        print("Answers are: ")
        print(session['answers'])
        print()

    elif digit == '2':
        session['answers'].append('No')
        print("Session is: ")
        print(session)
        print()
        print("Answers are: ")
        print(session['answers'])
        print()

    else:
        session['answers'].append('Unclear.')

    response = VoiceResponse()
    with response.gather(num_digits=1, action=url_for('question_three'), method="POST") as g:
        g.say('Question two. In the last 14 days, have you been in close contact with someone who had '
              'COVID or has since contracted COVID? Please press 1 for yes or 2 for no. ')
        return toXML(response)


@app.route('/survey/question_three', methods=['POST'])
def question_three():
    digit = request.form['Digits']

    print()
    print("Digits pressed are: " + digit)
    print()

    if digit == '1':
        session['answers'].append('Yes')
        print("Session is: ")
        print(session)
        print()
        print("Answers are: ")
        print(session['answers'])
        print()

    elif digit == '2':
        session['answers'].append('No')
        print("Session is: ")
        print(session)
        print()
        print("Answers are: ")
        print(session['answers'])
        print()

    else:
        session['answers'].append('Unclear.')
        print("Session is: ")
        print(session)

    session.modified = True
    response = VoiceResponse()
    with response.gather(num_digits=1, action=url_for('question_four'), method="POST") as g:
        g.say('Question three. In the last 14 days, have you taken a COVID test and received a positive result? '
              'Please press 1 for yes or 2 for no.')
        return toXML(response)


@app.route('/survey/question_four', methods=['POST'])
def question_four():
    digit = request.form['Digits']

    print()
    print("Digits pressed are: " + digit)
    print()

    if digit == '1':
        session['answers'].append('Yes')
        print("Session is: ")
        print(session)
        print()
        print("Answers are: ")
        print(session['answers'])
        print()

    elif digit == '2':
        session['answers'].append('No')
        print("Session is: ")
        print(session)
        print()
        print("Answers are: ")
        print(session['answers'])
        print()

    else:
        session['answers'].append('Unclear.')
        print("Session is: ")
        print(session)

    session.modified = True
    response = VoiceResponse()
    with response.gather(num_digits=1, action=url_for('question_five'), method="POST") as g:
        g.say('Question four. In the last 14 days, have you experienced any of the following symptoms? '
              'Fever, headache, cough, sore throat, nausea, intestinal upset, loss of taste or smell. '
              'Please press 1 for yes or 2 for no.')
        return toXML(response)


@app.route('/survey/question_five', methods=['POST'])
def question_five():
    digit = request.form['Digits']

    print()
    print("Digits pressed are: " + digit)
    print()

    if digit == '1':
        session['answers'].append('Yes')
        print("Session is: ")
        print(session)
        print()
        print("Answers are: ")
        print(session['answers'])
        print()

    elif digit == '2':
        session['answers'].append('No')
        print("Session is: ")
        print(session)
        print()
        print("Answers are: ")
        print(session['answers'])
        print()

    else:
        session['answers'].append('Unclear.')
        print("Session is: ")
        print(session)

    session.modified = True
    response = VoiceResponse()
    with response.gather(num_digits=2, action=url_for('end_survey'), method="POST") as g:
        g.say('Last question. What is your age?')
        return toXML(response)


@app.route('/survey/end_survey', methods=['POST'])
def end_survey():
    digit = request.form['Digits']
    print()
    print("Digits pressed are: " + digit)

    session['answers'].append(digit)

    print()
    print("Session is: ")
    print(session)
    print()
    print("Answers are: ")
    print(session['answers'])
    print()

    session.modified = True
    sheet.insert_row(session['answers'], 3)

    response = VoiceResponse()
    response.say('Thank you for taking this survey. Your responses will be sent to our office. You may press the # key '
                 'at any time in order to end the call. Have a great day!')
    return toXML(response)


if __name__ == "__main__":
    app
