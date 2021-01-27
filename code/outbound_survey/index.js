const express = require("express");
const { RestClient } = require('@signalwire/node')

const i18n = {
  'intro': {
    'en': "Hello, we have some questions for you. Press 1 for English",
    'es': "Hola, tenemos algunas preguntas para ti. Presione 2 para español"
  },
  'question': {
    'en': "What is your favorite food?",
    'es': "¿Cuál es tu comida favorita?"
  },
  'closing': {
    'en': "That sounds delicious!",
    'es': "¡Eso suena delicioso!"
  },
  'sorry': {
    'en': "Sorry, I did not understand",
    'es': "Perdón no entendí"
  }
}

const sayWithOptions = function(say_what, response, language = 'en') {
  response.say({
    language: language
  }).ssmlProsody({
    rate:'95%'
  }, say_what);
};

function respondAndLog(res, response) {
  console.log(response.toString());
  res.send(response.toString());
}

var app = express();
app.use(express.urlencoded());

app.listen(process.env.PORT || 3000, () => {
 console.log("Server running on port 3000");
});

app.post("/start", (req, res, next) => {
  var response = new RestClient.LaML.VoiceResponse();
  if (req.body.Digits !== undefined){
    if (req.body.Digits == '1'){
      response.redirect('/question?lang=en')
    } else if (req.body.Digits == '2') {
      response.redirect('/question?lang=es')
    } else {
      sayWithOptions(i18n['intro']['en'], response, 'en')
      sayWithOptions(i18n['intro']['es'], response, 'es')
      response.redirect('/start')
    }
  } else {
    gather = response.gather({ timeout: 5, numDigits: 1, action: '/start' })
    sayWithOptions(i18n['intro']['en'], gather, 'en')
    sayWithOptions(i18n['intro']['es'], gather, 'es')
  }

  respondAndLog(res, response);
 });

 app.post("/question", (req, res, next) => {
  var response = new RestClient.LaML.VoiceResponse();
  var lang = req.query.lang

  if (req.body.SpeechResult !== undefined ) {
    sayWithOptions(req.body.SpeechResult + "?", response, lang)
    sayWithOptions(i18n['closing'][lang], response, lang)
    response.hangup();
  } else {
    gather = response.gather({ input: 'speech', speechTimeout: 'auto' })
    sayWithOptions(i18n['question'][lang], gather, lang)
  }

  respondAndLog(res, response);
 });