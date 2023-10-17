// Required dependencies
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Deepgram } = require('@deepgram/sdk');

// Load your environment variables from the .env file
require('dotenv').config();

// Create a new Express server
const app = express();
const server = http.createServer(app);

// Initiate a new WebSocket Server instance on the Express server
const deepgramWss = new WebSocket.Server({ server });

// Listen for incoming connections to the WebSocket server
// If a new connection is received, the setupNewClient function is called with the connected client as an argument
deepgramWss.on('connection', setupNewClient);

function setupNewClient(wsClient) {
    // The recognition stream will be used to transcribe live audio
    let recognizeStream = null;

    // Function to start the recognition stream
    const startStream = () => {
        console.log('Starting transcription stream...')

        // Initialize the Deepgram SDK with the API key stored in your environment variables
        const deepgram = new Deepgram(process.env.DEEPGRAM_SECRET);

        // Configure the recognition stream and 'mulaw' audio encoding type with '8000' sample rate
        recognizeStream = deepgram.transcription.live({
            punctuate: true,
            interim_results: false,
            language: 'en',
            model: 'general-enhanced',
            encoding: 'mulaw',
            sample_rate: 8000
        });

        // When a transcript is received from Deepgram, log it to console
        recognizeStream.addListener('transcriptReceived', (transcription) => {
            const result = JSON.parse(transcription);
            if (result.channel) {
                console.log('Transcript: ', result.channel.alternatives[0].transcript);
            }
        });
    }

    // Function to stop the recognition stream
    const stopStream = () => {
        console.log('Stopping transcription stream...')
        if (recognizeStream) {
            recognizeStream.finish();
            recognizeStream = null;
        }
    }

    // When a message is received from WebSocket client, start transcription stream if it's not already started
    // Then send the audio data (non-string message) to the recognition stream for transcription
    wsClient.on('message', async message => {
        if (!recognizeStream) {
            console.log('Start tap');
            startStream();
        }

        // If the message is a string, ignore it
        if (typeof message === 'string') return;

        // If the recognition stream is ready, send the audio data to it
        if (recognizeStream && recognizeStream.getReadyState() === 1) {
            recognizeStream.send(message);
        }
    });

    // When the WebSocket connection is closed, stop the recognition stream
    wsClient.on('close', () => {
        console.log('WebSocket client closed..')
        stopStream()
    });
}

// Start the server on the preset port, or fall back to port 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});