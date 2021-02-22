const { RelayConsumer } = require('@signalwire/node')

const consumer = new RelayConsumer({
  project: process.env.SIGNALWIRE_PROJECT_KEY,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: ['outbound'],

  ready: async ({ client }) => {
      client.__logger.setLevel(client.__logger.levels.DEBUG)
  },

  onTask: async (message) => {
    console.log(message);
    const params = { type: 'phone', from: process.env.FROM_NUMBER, to: message.destination }
    const { successful: dialed, call } = await consumer.client.calling.dial(params)
    if (!dialed) {
      console.error('Outbound call failed or not answered.')
      return
    }

    const { successful, result, event } = await call.amd({ wait_for_beep: true })
    if (successful) {
      console.log('Detection result:', result, 'Last event:', event)
      if (result == 'HUMAN') {
        await call.connect(
          { type: 'phone', to: process.env.AGENT_NUMBER, timeout: 20 }
        )
      } else {
        await call.playTTS({ text: 'This is a message that we are leaving on the answering machine', gender: 'male' })
      }
    } else {
      console.error('Error during detection', event)
    }    
  }
})

console.log('Running', consumer.project, consumer.token)

consumer.run()