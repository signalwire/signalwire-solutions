var client;
var currentCall = null;
let _statsInterval = null;

var _timer = null

ready(function() {
  _timer = performance.now();
  connect();
});

/**
  * Connect with Relay creating a client and attaching all the event handler.
*/
function connect() {
  client = new Relay({
    project: project,
    token: token
  });

  client.iceServers = [
      {
        "urls": [ "stun:stun.l.google.com:19302" ]
      }
    ]

  client.__logger.setLevel(client.__logger.levels.INFO)

  client.remoteElement = 'remoteVideo';
  client.localElement = 'localVideo';

  client.enableMicrophone();
  client.disableWebcam();

  client.on('signalwire.ready', function() {
    setStatus('Registered to SignalWire');
    show('callForm');
    _timer = null
  });

  // Update UI on socket close
  client.on('signalwire.socket.close', function() {
    setStatus('Ready');
    show('callbtn');
    hide('hangupbtn');
  });

  // Handle error...
  client.on('signalwire.error', function(error){
    console.error("SignalWire error:", error);
  });

  client.on('signalwire.notification', handleNotification);

  setStatus('Connecting...');
  client.connect();
}

function disconnect() {
  setStatus('Disconnecting...');
  client.disconnect();
}

/**
  * Handle notification from the client.
*/
function handleNotification(notification) {
  console.log("notification", notification.type, notification);
  switch (notification.type) {
    case 'callUpdate':
      handleCallUpdate(notification.call);
      break;
    case 'userMediaError':
      // Permission denied or invalid audio/video params on `getUserMedia`
      console.error("SignalWire userMediaError:", notification);
      break;
  }
}

/**
  * Update the UI when the call's state change
*/
function handleCallUpdate(call) {
  currentCall = call;

  switch (call.state) {
    case 'new': // Setup the UI
      break;
    case 'trying': // You are trying to call someone and he's ringing now
      setStatus('Ringing...');
      break;
    case 'recovering': // Call is recovering from a previous session
      if (confirm('Recover the previous call?')) {
        currentCall.answer();
      } else {
        currentCall.hangup();
      }
      break;
    case 'ringing': // Someone is calling you
      // we don't actually need this here
      console.log('or do we');
      break;
    case 'active': // Call has become active
      setStatus('Call is active');
      hide('callbtn');
      show('hangupbtn');
      _timer = null
      break;
    case 'hangup': // Call is over
      setStatus('Ready');
      show('callbtn');
      hide('hangupbtn');
      break;
    case 'destroy': // Call has been destroyed
      currentCall = null;
      break;
  }
}

/**
  * Make a new outbound call
*/
async function makeCall() {
  _timer = performance.now();
  var number = document.getElementById('destination').value;
  var formData = new FormData();
  formData.append('number', number);
  const data = new URLSearchParams(formData);

  // do not await so we get the call in the room ASAP
  fetch('/call', {
    method: 'POST',
    body: data
  });

  var destination = number + '@' + app;
  console.log('Calling ', destination);
  const params = {
    destinationNumber: destination,
    audio: true,
    video: false,
  };

  currentCall = client.newCall(params);
}

/**
  * Hangup the currentCall if present
*/
function hangUp() {
  if (currentCall) {
    currentCall.hangup();
  };
}

// these are support functions, not part of the main application

function show(selector) {
  var x = document.getElementById(selector);
  x.style.display = "block";
}

function hide(selector) {
  var x = document.getElementById(selector);
  x.style.display = "none";
}

function setStatus(text) {
  document.getElementById("status").innerHTML = text;
}

// jQuery document.ready equivalent
function ready(callback) {
  if (document.readyState != 'loading') {
    callback();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState != 'loading') {
        callback();
      }
    });
  }
}