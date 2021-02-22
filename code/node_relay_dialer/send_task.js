const { Task } = require('@signalwire/node')

const yourTask = new Task(process.env.SIGNALWIRE_PROJECT_KEY, process.env.SIGNALWIRE_TOKEN)
console.log(process.env.SIGNALWIRE_PROJECT_KEY, process.env.SIGNALWIRE_TOKEN)

yourTask.deliver('outbound', { 'destination': process.env.TO_NUMBER } )