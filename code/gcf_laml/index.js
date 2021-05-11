const { RestClient } = require('@signalwire/node')

exports.helloLaml = (req, res) => {
  const response = new RestClient.LaML.VoiceResponse();
  try {
    var d = new Date();
    if (d.getDay() == 0) {
      response.say('Happy Sunday! Our store is closed today');
    } else {
      response.say('Hello! Our store is open from 9 to 6 today.');
    }
  } catch(err) {
    console.log(err.message);
  } finally {
    res.status(200)
      .set('Content-Type', 'text/xml')
      .send(response.toString());
  }
};