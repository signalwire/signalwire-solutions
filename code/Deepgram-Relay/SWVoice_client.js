const { Voice } = require('@signalwire/realtime-api')
require('dotenv').config()

const projectId = process.env.SIGNALWIRE_PROJECT_KEY
const token = process.env.SIGNALWIRE_TOKEN

// Setup Client
const client = new Voice.Client({
    project: projectId,
    token: token,
    contexts: ['asr'],
    debug: {
        logWsTraffic: false,},
})
// Answer Call and Stream Audio via 'tap'
client.on('call.received', async (call) => {
    console.log('Got call', call.from, call.to)
    try {
        await call.answer();
        console.log("Inbound call answered");
        const tap = await call.tapAudio({
            direction: "both",
            device: {
                type: "ws",
                uri: process.env.TAP_ADDRESS,
            },
        });
        console.log("Tap id:", tap.id);
    } catch (error) {
        console.error("Error answering inbound call", error);
    }
});