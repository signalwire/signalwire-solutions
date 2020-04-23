# SIP on SignalWire

In our previous posts, we have explored the many opportunities the LaML API provides for application developers.

SignalWire also supports the standard in VoIP telephony, the SIP protocol. This allows you to connect your devices and systems to the SignalWire Cloud, and to leverage the available features from existing SIP infrastructure.

## Creating and registering a SIP endpoint

To register and use SIP endpoints to place calls, head to the `SIP` page in your dashboard.

First of all, let's take a look at the `SIP Settings` tab.

![SignalWire SIP Profile Settings](/assets/sip_profile_settings.png)

This is where the most important options for SIP are set. Your SIP registration URI has been filled in with a random string, and you can change that to something more legible if you so wish.

Setting a default number to use as caller ID is also possible, and you can manage your codec settings from here.

Create your endpoint by clicking on `Endpoints` and then `New`.

![Create SIP endpoint](/assets/create_sip_endpoint.png)

Endpoints can also be created programmatically as discussed [in this article](https://signalwire.com/blogs/product/programmable-sip-connectivity-and-routing). That would be useful for an application needing to create many endpoints for a set of clients.

### Registering to SignalWire

Depending on your SIP client, you might have to enter settings in a different way. The generic setup would be:

```
Username: the username portion of the SIP address you set up
Domain: the domain portion of the SIP address
Password: the password you set
```

A SIP desktop client example is Bria, a very feature-complete and usable softphone. Setting that up for SignalWire SIP is very simple.

![SignalWire SIP Bria Settings](/assets/bria_settings.png)

You could of course use the same credentials to connect your hardware phone or a PBX such as FusionPBX or FreePBX.

### Making calls from your endpoint

After registering, just dial a PSTN number (try `+1-202-762-1401` for the Washington D.C. weather phone). You can also dial SIP addresses straight away.


## Triggering outbound calls via LaML

If you are using LaML, you might want to dial out to a SIP target using the `<Dial>` verb. In that case, the `<Sip>` tag is what you would use.

Documented [here](https://docs.signalwire.com/topics/laml-xml/#voice-laml-dial-sip), it allows you to dial out to SIP addresses with various options. You can set a `StatusCallback` URL as with other `<Dial>` targets, to get status updates during the process.

SignalWire supports authenticating to a SIP proxy via the `username` and `password` attributes, and the standard SIP URI components can be added to drive specific application needs.

Here is a full example:

{% gist 476ec2f7f6137d84aca2d039904f5cad %}

> Caller IDs work differently when dialing out to SIP: you can use any ID, and it assumed to be validated by your SIP upstream. This applies both on LaML and outbound REST calls.

## Making outbound calls via the LaML API

To trigger outbound calls using the LaML API, you can use the Calls LaML REST API documented [here](https://docs.signalwire.com/topics/laml-api/#api-reference-calls-create-a-call).

The method supports a long list of parameters, and the relevant ones for SIP are `SipAuthUsername` and `SipAuthPassword`. The `Url` would support the same structure and SIP options as the LaML version.

A full example in CURL and Ruby:

{% gist a811a24f921d0429127f9983bf069c92 %}

## Inbound SIP: the Domain Application

To receive calls from a SIP source to your SignalWire account in a Bring Your Own Connectivty (BYOC) scenario, you would use the SIP Domain Application features.

It allows you to create a domain to which to point all of your SIP calls.

![Setting up a Domain App](/assets/creating_domain_app.png)

Dialing `anything@your-domain.dapp.signalwire.com` will get the call into the LaML webhook you specify.

This allows you to use connectivity from any provider capable of sending a call to a SIP address to use SignalWire services.

> Always use whitelisting of IPs if possible, as otherwise all requests to the domain will be processed.