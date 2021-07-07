require('dotenv').config()

const auth = {
    username: process.env.PROJECT_ID, // Project-ID
    password: process.env.API_TOKEN, // API token 
};
const apiurl = process.env.API_URL;
const ROOMNAME = "testroom";

// Basic express boilerplate
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const axios = require('axios')

const app = express();
app.use(bodyParser.json())
app.use(cors());
// End basic express boilerplate

async function CreateRoomIfItDoesntExist(name) {
    console.log("Creating room " + name + " if it doesn't exist.")
    let existingrooms = []
    let room_name = name.toLowerCase();
    try {
        // Get the list of rooms
        console.log(" - Getting the list of rooms")
        let rooms = await axios.get(apiurl + "/rooms", { auth });
        existingrooms = rooms.data.data.map(x => x.name.toLowerCase())
        console.log(" - Rooms that currently exist: ", existingrooms)
    }
    catch (e) {
        console.log(e)
        return false;
    }

    try {
        // Create a new room if the room doesn't yet exist
        if (!existingrooms.includes(room_name)) {
            console.log(" - Room " + name + " didn't exist. Trying to create new room.")
            await axios.post(apiurl + "/rooms", { name: room_name }, { auth })
            console.log(" - New room created")
        }
        else {
            console.log(" - Room already existed. Doing nothing.")
        }
    }
    catch (e) {
        console.log(e);
        return false
    }
    return true;
}


// Endpoint to request token for video call
app.post('/get_token', async (req, res) => {
    let { user_name } = req.body;
    console.log("Received name", user_name)
    try {
        let token = await axios.post(
            apiurl + "/room_tokens",
            { user_name, room_name: ROOMNAME },
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
    if (await CreateRoomIfItDoesntExist(ROOMNAME))
        app.listen(port, () => {
            console.log("Server listening at port", port)
        });
    else console.log("Couldn't create room. Quitting.")
}

// Start the server
start(4000);
