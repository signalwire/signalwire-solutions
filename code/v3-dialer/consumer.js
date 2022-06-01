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
      from: '+13259995720',
      to: '+12019712404',
      timeout: 30,
    })
    const prompt = await call.promptTTS({
      text: 'Hello! You have an appointment tomorrow at 10 AM. Would you like to confirm it?',
      digits: {
        max: 1,
        digitTimeout: 2
      },
      speech: {
        endSilenceTimeout: 1,
        speechTimeout: 60,
        language: 'en-US',
        hints: ['yes', 'no']
      }
    })
    const result = await prompt.waitForResult();
    console.log(result)
  } catch (e) {
    console.log("Call not answered.")
  }
})
