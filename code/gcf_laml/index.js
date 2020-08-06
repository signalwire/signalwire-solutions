const { RestClient } = require('@signalwire/node')

exports.helloLaml = (req, res) => {
  const response = new RestClient.LaML.VoiceResponse();
  response.say('Welcome to SignalWire on Google Cloud Functions.');

  res.status(200)
    .set('Content-Type', 'text/xml')
    .send(response.toString());
};