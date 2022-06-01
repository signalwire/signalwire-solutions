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

client.on('call.received', async (call) => {
  console.log('Got call', call.from, call.to)

  try {
    await call.answer()
    console.log('Inbound call answered')

    console.log('headers', call.headers)

    await call.playTTS({ text: "Hello! This is a test call."})
  } catch (error) {
    console.error('Error answering inbound call', error)
  }
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
      to: '+14043287382',
      timeout: 30,
    })
  } catch (e) {
    console.log("Call not answered.")
  }
})
