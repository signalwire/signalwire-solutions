const { RestClient } = require('@signalwire/node')

exports.helloLaml = (req, res) => {
  const response = new RestClient.LaML.VoiceResponse();
  try {
    var from_num = req.body.From.split('@')[0].replace('sip:', '');
    

    if (from_num.match(/\+\d{11}/)) {
      dial = response.dial({timeout: 30, callerID: from_num});
      dial.number(req.body.SipUser);
    } else {
      response.hangup
    }

    console.log(response.toString());
  } catch(err) {
    console.log(err.message);
  } finally {
    res.status(200)
      .set('Content-Type', 'text/xml')
      .send(response.toString());
  }
};