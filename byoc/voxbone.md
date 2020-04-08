# BYOC with Voxbone via SIP

SignalWire allows you to easily integrate with your existing providers via SIP. In this guide, we are going to see how to use [Voxbone](https://www.voxbone.com/) to Bring Your Own Carrier (BYOC) to SignalWire.

Voxbone [https://www.voxbone.com/](https://www.voxbone.com/) is a leading provider of SIP trunks, phone numbers and connectivity all over the world.

## Getting calls from Voxbone to SignalWire

We are going to achieve the inbound part of the integration by using the SignalWire SIP Domain App feature, on which you can find more information [here](/intros/sip_on_signalwire).

First of all, create a new SIP Domain App in your SignalWire dashboard and take note of the URL you created. We suggest also pointing it at a simple LaML bin for testing.

![Setting up a Domain App](/assets/creating_domain_app.png)

Now, head over to Voxbone. Our first step will be to create a Voice URI corresponding to the Domain App you set up earlier. Go to `Configure > Voice URIs` and create a new one.

![Voxbone voice URI creation](/assets/byoc/voxbone_voice_uri.png)

After setting that up, purchase a DID by going to `Buy > Buy DIDs` and follow the process.

For some countries, you will need to provide extra information and proof of address. To link an address to your DIDs, use the `Configure > Manage Addresses` page on the Voxbone website.

![Voxbone DID purchase](/assets/byoc/voxbone_buy_dids.png)

You will be transferred to the `Configure DID` screen.

Here you need to first search and select the DIDs you want to point at the Domain App. Once you have done that, click on the `Voice` tab, on `Voice URI`, pick the URI you created above, then apply the changes.

![Voxbone DID purchase](/assets/byoc/voxbone_configure_did.png)

Dial your new number, and hear the LaML output you set up earlier. Done!

> Before you dial your number, check you have enough channels and capacity purchased on the Voxbone account. More information can be found [here](https://support.voxbone.com/hc/en-us/articles/360001784418-Understanding-capacity-groups?flash_digest=011570b050314a2abbc768e75d2b632e75145792).

## Outbound dialing over Voxbone from SignalWire

Dialing out from your SignalWire account over a Voxbone trunk is accomplished similarly to [generic SIP usage](/intros/sip_on_signalwire).

You will use a LaML or REST API request to dial out via SIP to Voxbone.

First of all, you need to set up your outbound credentials on Voxbone. Head to `Configure > Configure Outbound Voice` and set a username and password.

![Voxbone Credentials](/assets/byoc/voxbone_outbound.png)

Voxbone provides an easy AnyCast IP address to use as the dial destination: `81.201.89.110`.

After you have those credentials, you can dial out from LaML by simply referencing your above credentials and the AnyCast IP. The user portion of your SIP address will be the phone number you would like to dial, ie. `+199955566777@81.201.89.110`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="+18889090909">
    <Sip username="youruser" password="yourpass">
      sip:+199955566777@81.201.89.110
    </Sip>
  </Dial>
</Response>
```

The same thing goes for dialing out with the LaML REST API.

```ruby
require 'signalwire/sdk'
client = Signalwire::REST::Client.new 'your-project', 'your-token', signalwire_space_url: "example.signalwire.com"

call = client.calls.create(
  url:  'http://YOURSPACE.signalwire.com/YOUR-LAML-BIN-ID',
  to:   'sip:+199955566777@81.201.89.110',
  from: '+15559988777',
  sip_auth_username: 'youruser',
  sip_auth_password: 'yourpass'
)

puts call.sid
```

```sh
curl https://<YOURSPACE>.signalwire.com/api/laml/2010-04-01/Accounts/<YOURACCOUNTSID>/Calls.json \
  -X POST \
  --data-urlencode "Url=http://your-application.com/docs/voice.xml" \
  --data-urlencode "To=sip:+199955566777@81.201.89.110" \
  --data-urlencode "From=+15550011222" \
  --data-urlencode "SipAuthUsername=youruser" \
  --data-urlencode "SipAuthPassword=yourpass" \
  -u "YourProjectID:YourAuthToken"
 ```

## Conclusions

 Setting up Voxbone to integrate with SignalWire is easy and provides you access to DIDs from many countries. Let us know what you build!