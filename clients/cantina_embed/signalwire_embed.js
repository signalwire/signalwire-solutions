var SignalWireEmbed = {
  scriptElm: null,
  params: null,
  client: null,
  currentCall: null,
  ready: function(callback) {
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
  },

  setup: function() {
    this.scriptElm = document.getElementById('signalwire-embed');
    var url = new URL(this.scriptElm.src);
    this.params = new URLSearchParams(url.search);

    var cssUrl = url.href.split('?')[0].replace('js', 'css')
    
    this.createMainDiv();
    this.injectStylesheet(cssUrl);
    this.injectScripts();
  },

  createMainDiv: function() {
    var mainDiv = document.createElement('div');
    mainDiv.innerText = 'Embed Div';
    mainDiv.style = "width: 800px; height: 600px; position: relative;"

    var remoteVideo = document.createElement('video');
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideo.id = "signalWireRemoteVideo";
    remoteVideo.style = "background-color: black; width: 800px; height: 600px;"

    // var localVideo = document.createElement('video');
    // localVideo.autoplay = true;
    // localVideo.playsInline = true;
    // localVideo.id = "signalWireLocalVideo";
    // localVideo.style = "background-color: black; width: 400px; height: 300px;"

    var startCallBtn = document.createElement('button');
    startCallBtn.type = 'button';
    startCallBtn.id = "startCallBtn";
    startCallBtn.innerText = "Join the room"
    startCallBtn.style = "position:absolute; left:50%; top:50%; transform: translate(-50%, -50%)"
    startCallBtn.addEventListener('click', function(){
      SignalWireEmbed.connect();
    });

    var hangupBtn = document.createElement('button');
    hangupBtn.type = 'button';
    hangupBtn.id = "hangupBtn";
    hangupBtn.innerText = "Hang up"
    hangupBtn.style = "position:absolute; left:50%; bottom: 5%; transform: translate(-50%, -5%); display: none"
    hangupBtn.addEventListener('click', function(){
      SignalWireEmbed.hangup();
    });

    mainDiv.appendChild(remoteVideo);
    // mainDiv.appendChild(localVideo);
    mainDiv.appendChild(startCallBtn);
    mainDiv.appendChild(hangupBtn);

    this.scriptElm.parentNode.insertBefore(mainDiv, this.scriptElm);
  },
  injectStylesheet: function(src) {
    var link = document.createElement('link');
    link.href = src;
    link.rel = 'stylesheet';
    document.head.append(link);
  },
  injectScripts: function() {
    this.injectScript("https://webrtc.github.io/adapter/adapter-latest.js")
      .then(() => {
        this.injectScript("https://unpkg.com/@signalwire/js")
          .then(() => {
            console.log('Scripts loaded!');
            this.setupClient();
          })
      })
  },
  injectScript: function(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.addEventListener('load', resolve);
        script.addEventListener('error', e => reject(e.error));
        document.head.appendChild(script);
    });
  },
  setupClient: function(){
    var clientParams = {
      host: this.params.get('node') + ".sw.work/freeswitch",
      login: 'guest',
      password: 'signalwire',
      callerName: this.params.get('user'),
      callerNumber: 'guest'
    }

    var client = new Verto(clientParams);

    client.remoteElement = 'signalWireRemoteVideo';
    // client.localElement = 'signalWireLocalVideo';
    client.iceServers = [{ urls: ['stun:stun.l.google.com:19302'] }];
    client.enableMicrophone();
    client.enableWebcam();

    client.on('signalwire.ready', function() {
      console.log('Connected');
      // here we will dial the call
      SignalWireEmbed.startCall();
    });

    // Update UI on socket close
    client.on('signalwire.socket.close', function() {
      console.log('Disconnected');
    });

    // Handle error...
    client.on('signalwire.error', function(error){
      console.error("SignalWire error:", error);
    });

    client.on('signalwire.notification', SignalWireEmbed.handleNotification);
    this.client = client;
    console.log('Client is set up')
  },
  // call this from the button handler
  connect: function() {
    document.getElementById('startCallBtn').style.display = 'none';
    this.client.connect();
  },

  startCall: function() {
    console.log('calling', this.params.get('room'))
    const params = {
      destinationNumber: this.params.get('room'),
      audio: true,
      video: true
    };

    SignalWireEmbed.currentCall = SignalWireEmbed.client.newCall(params);
  },
  handleNotification: function(notification) {
    console.log("notification", notification.type, notification);
    switch (notification.type) {
      case 'callUpdate':
        SignalWireEmbed.handleCallUpdate(notification.call);
        break;
      case 'userMediaError':
        // Permission denied or invalid audio/video params on `getUserMedia`
        console.log('There was an userMediaError');
        break;
    }
  },

  handleCallUpdate: function(call) {
    switch (call.state) {
      case 'active': // Call has become active
      SignalWireEmbed.handleCallActive()
        break;
      case 'destroy': // Call has been destroyed
        console.log('call was destroyed')
        document.getElementById('hangupBtn').style.display = 'none';
        document.getElementById('startCallBtn').style.display = 'block';
        SignalWireEmbed.currentCall = null;
        break;
    }
  },

  handleCallActive: function() {
    console.log('call has become active');
    document.getElementById('hangupBtn').style.display = 'block';
    document.getElementById('startCallBtn').style.display = 'none';
  },
  hangup: function() {
    console.log('hanging up')
    if (SignalWireEmbed.currentCall) {
      SignalWireEmbed.currentCall.hangup()
    }
  }
}

SignalWireEmbed.ready(function() {
  SignalWireEmbed.setup();
});