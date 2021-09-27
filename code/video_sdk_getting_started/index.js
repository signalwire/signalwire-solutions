require('dotenv').config()

const auth = {
    username: process.env.PROJECT_ID, // Project-ID
    password: process.env.API_TOKEN, // API token 
};
const apiurl = process.env.API_URL;

// Basic express boilerplate
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const axios = require('axios')

const app = express();
app.use(bodyParser.json())
app.use(cors());
// End basic express boilerplate

// Endpoint to request token for video call
app.post('/get_token', async (req, res) => {
    let { user_name, room_name } = req.body;
    console.log("Received name", user_name)
    try {
        let token = await axios.post(
            apiurl + "/room_tokens",
            {
                user_name,
                room_name,
                permissions: [
                    "room.self.audio_mute",
                    "room.self.audio_unmute",
                    "room.self.video_mute",
                    "room.self.video_unmute"
                ]
            },
            { auth }
        );
        console.log(token.data.token)
        return res.json({ token: token.data.token })
    } catch (e) {
        console.log(e);
        return res.sendStatus(500);
    }
})

app.use('/', express.static("frontend"))


async function start(port) {
    app.listen(port, () => {
        console.log("Server listening at port", port)
    });
}

// Start the server
start(4000);
