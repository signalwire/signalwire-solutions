require('dotenv').config()
let { Voice, Task } = require('@signalwire/realtime-api')

const client = new Voice.Client({
  project: process.env.SIGNALWIRE_PROJECT_ID,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: ['office'],
  debug: {
    logWsTraffic: true,
  },
})

const taskClient = new Task.Client({
  project: process.env.SIGNALWIRE_PROJECT_ID,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: ['office']
})

taskClient.on('task.received', async (payload) => {
  console.log('Task Received', payload)
  try {
    const call = await client.dialPhone({
      from: process.env.CALLER_ID,
      to: payload.number,
      timeout: 30,
    })
    const basePrompt = payload.message;
    var result = await promptYesNo(call, basePrompt);
    if (result == 'invalid') {
      console.log('first input failed')
      //ask again
      result = await promptYesNo(call, "Sorry! I did not understand that. " + basePrompt + " Press 1 for yes and 2 for no.");
    }

    if (result == 'invalid') {
      // still invalid, whatever
      await call.playTTS({ text: "Sorry! I did not understand that again. Let me transfer you."})
      connectToAgent(call)
    } else if (result == 'yes')  {
      // do something with the confirmation
      console.log('playing message')
      await call.playTTS({ text: "Good! Your appointment is confirmed. Goodbye!"})
      await call.hangup();
    } else if (result == 'no')  {
      await call.playTTS({ text: "I understand you would like to change your appointment. Let me transfer you."})
      await connectToAgent(call);
    }
    
  } catch (e) {
    console.log("Call not answered.", e)
  }
})

async function connectToAgent(call) {
  const peer = await call.connectPhone({
    from: process.env.CALLER_ID,
    to: process.env.AGENT_NUMBER,
    timeout: 30
  })

  await peer.waitForDisconnected();
}

async function promptYesNo(call, text) {
  var match = 'invalid';
  const prompt = await call.promptTTS({
    text: text,
    digits: {
      max: 1,
      digitTimeout: 5
    },
    speech: {
      endSilenceTimeout: 1,
      speechTimeout: 5,
      language: 'en-US',
      hints: []
    }
  })
  const result = await prompt.waitForResult();
  console.log(result)
  if (result.type == 'speech') {
    if (result.text == 'yes' || result.text == 'no') {
      match = result.text;
    }
  }

  if (result.type == 'digit') {
    console.log('params', result.digits)
    if (result.digits == '1') {
      match = 'yes';
    } else if (result.digits == '2') {
      match = 'no';
    }
  }

  return match;
}