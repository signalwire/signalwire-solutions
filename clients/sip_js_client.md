# SIP.js client

The simplest way to achieve a phone or video call in the browser is to use a Javascript SIP library. In this tutorial, we will be exploring the usage of [SIP.js](https://sipjs.com/) to connect to a SignalWire SIP endpoint.

## Creating the endpoint

Refer to [this guide](/intros/sip_on_signalwire.md) to find out how to create the SIP endpoint. Take note of the domain, username and password you set up.

## Setting up SIP.js

[SIP.js](https://sipjs.com/) is a Javascript library that supports multiple modes of operation and many advanced SIP specifications.

In our tutorial, we will be using the [Simple](https://sipjs.com/guides/simple/) interface, that abstracts away most of the complexity of setting up a client.

First of all, we will set up the User Agent (UA).

```javascript
var domain = "yourdomain.sip.signalwire.com";
var user = "your_sip_endpoint_username";
var password = "the password you set up";

options = {
  media: {
    local: {
      video: document.getElementById('localVideo')
    },
    remote: {
      video: document.getElementById('remoteVideo'),
      audio: document.getElementById('remoteVideo')
    }
  },
  wsServers: domain,
  ua: {
    wsServers: "wss://" + domain,
    uri: sip_url,
    password: pass
  }
};

simple = new SIP.Web.Simple(options);
```

The most important settings are `wsServers` and `uri`. `wsServers` needs to be set to the domain part of your SIP uri.

To set up an audio-only call, you would instead use only:

```javascript
//...
media: {
  remote: {
    audio: document.getElementById('remoteVideo')
  }
},
//...
```

and the rest will be the same.

The `localVideo` and `remoteVideo` elements need to be `<video>` tags that are present in the page. They will be where the local video and the entire remote stream, including video and audio, will be displayed.

```html
<video id="remoteVideo"></video>
<video id="localVideo" muted="muted"></video>
```

## Responding to events

SIP.js Simple provides many events you can attach a handler to, for the various call flow steps.

In our example application, we are setting up a few of them like this:

```javascript
simple.on('registered', function() {
  console.log('Registered to SIgnalWire');
});

simple.on('connecting', function() {
  console.log('Call ringing');
});

simple.on('connected', function() {
  console.log('Call connected!');
});

simple.on('ringing', function() {
  console.log('Incoming call');
});
```

You can find the full list of events [here](https://sipjs.com/api/0.15.0/simple/).

## Making and receiving calls

The SIP.js Simple library makes it very easy to make and receive calls.

```javascript
// To make a call
simple.call(destination);

// To receive a call
simple.on('ringing', function() {
  simple.answer();
});

// To hangup the active call
simple.hangup();
```

## The example application

You can find our [example application](/code/sip_client/index.html) in the Git repository for the guides.

It is a very simple single page application that can make and receive calls. It does include some other cool tricks (such as an embedded ring tone!), but most of it is just setting up the connection and tying into the library.

The provided phone number is a Washington D.C. weather service phone, but you can try calling other SignalWire registered endpoints (`user@YOURDOMAIN.sip.signalwire.com`) or any phone number.

Video will automatically be used if the other endpoint is capable of it.

