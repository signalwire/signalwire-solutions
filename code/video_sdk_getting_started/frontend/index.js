"use strict"
const $ = x => document.getElementById(x);

const backendurl = "http://localhost:4000"

let roomSession;

// Simple js to control when forms appear
function gotopage(pagename) {
    if (pagename === "getusername") {
        $("getusername").style.display = "block"
        $("videoroom").style.display = "none"
        $("loading").style.display = "none"
    }
    else if (pagename === "videoroom") {
        $("getusername").style.display = "none"
        $("videoroom").style.display = "block"
        $("loading").style.display = "none"
    }
    else {
        $("getusername").style.display = "none"
        $("videoroom").style.display = "none"
        $("loading").style.display = "block"
    }
}

async function joinwithusername() {
    const username = $("usernameinput").value.trim();
    const roomname = $("roomnameinput").value.trim();
    console.log("The user picked username", username)
    gotopage("loading")

    try {
        let token = await axios.post(backendurl + "/get_token", {
            user_name: username,
            room_name: roomname
        });
        console.log(token.data)
        token = token.data.token

        try {
            console.log("Setting up RTC session")
            roomSession = new SignalWire.Video.RoomSession({
                token,
                rootElement: document.getElementById('root'),
            })

            roomSession.on("room.joined", e => logevent("You joined the room"))
            roomSession.on("member.joined", e => logevent(e.member.name + " has joined the room"))
            roomSession.on("member.left", e => logevent(e.member.id + " has left the room"))

            await roomSession.join()
        } catch (error) {
            console.error('Something went wrong', error)
        }

        gotopage("videoroom")
    }
    catch (e) {
        console.log(e)
        alert("Error encountered. Please try again.")
        gotopage("getusername")
    }
}

async function hangup() {
    if (roomSession) {
        await roomSession.leave();
        gotopage("getusername")
    }
}

function logevent(message) {
    $("events").innerHTML += "<br/>" + message;
}

//Start
gotopage("getusername")
