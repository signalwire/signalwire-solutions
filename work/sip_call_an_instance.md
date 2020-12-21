# SignalWire Work: making a SIP phone call into an instance

There are a few steps needed to call a specific room on your SignalWire Work instance using SIP, so here is a quick guide!

If you are not familiar with SIP on SignalWire, our basic introduction can be found [here](https://signalwire.com/resources/guides/sip).

## 1. Set up a LaML bin

In your SignalWire dashboard, create a LaML bin set up with the following content:

```
<?xml version="1.0" encoding="UTF-8"?>
<Response>
 <Dial>
  <Sip>{{SipUser}}@YOURDOMAIN.sw.work:1060;transport=tcp</Sip>
 </Dial>
</Response>
```

## 2. Create a SIP Domain App

Head to the `SIP` tab in your dashboard, and create a new SIP Domain App, pointing it at the URL of the previous LaML bin.

You will have a Domain URL similar to `YOURSPACE-APPNAME.dapp.signalwire.com`.

## 3. Create a SIP registered endpoint

For security, SignalWire will only accept a call coming from a registered SIP endpoint created on the same account.

On the `SIP` tab of the dashboard, create a new SIP endpoint and have your softphone register.

## 4. Make the call

All that is left to do now is to call your Domain App from the SIP registered endpoint.

For example, to call into a room named `Lobby`, you would dial `Lobby@YOURSPACE-APPNAME.dapp.signalwire.com`.

That's all! You should be connected to the room.