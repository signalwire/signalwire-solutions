# Messaging with SignalWire

The SignalWire platform makes it easy to send and receive SMS using our REST APIs and a bit of LAML.

## Sending messages

Our [REST API SDKs](https://docs.signalwire.com/topics/laml-api/#laml-rest-api-client-libraries-and-sdks) are available in many languages. Examples in this post will be presented in Python. For a quick introduction to the SDKs, refer to [this previous post](/intros/laml_rest_api.md).

Sending a text message or an MMS is very simple, as you can see in our first example:

```python
from signalwire.rest import Client as signalwire_client

client = signalwire_client("YourProjectID", "YourAuthToken", signalwire_space_url = 'example.signalwire.com')

message = client.messages.create(
                              from_='+15550011222',
                              body='Hello World!',
                              to='+15550011333'
                          )

print(message.sid)
```

The `from` parameter should always be a number from your SignalWire account. Note that the underscore in the parameter name is a Python specific requirement.

Now let's explore how to send an MMS, adding a `media_url` parameter, pointing at a file available via HTTP. The size limit is currently 0.5Mb and the list of accepted MIME types can be found [here](https://docs.signalwire.com/topics/laml-xml/#messaging-laml-overview-mime-types).

```python
from signalwire.rest import Client as signalwire_client

client = signalwire_client("YourProjectID", "YourAuthToken", signalwire_space_url = 'example.signalwire.com')

message = client.messages.create(
                              from_='+15550011222',
                              body='Hello World!',
                              to='+15550011333',
                              media_url: 'https://SOME-EXAMPLE-URL'
                          )

print(message.sid)
```

You might find it useful to specify a `status_callback` parameter pointing at a URL in your application. That webhook will receive updates on the message delivery and eventual errors. You can find the full list of parameters [here](https://docs.signalwire.com/topics/laml-api/#api-reference-messages-create-a-message).

## Message deliverability

Sending SMS and MMS requires some care to avoid triggering spam filters and to keep your traffic within the legitimate guidelines. To help your messages be delivered in the best fashion, SignalWire published a [Code of Conduct](https://signalwire.com/legal/messaging-code-of-conduct). It contains best practices like obtaining proper permission and honoring stop keywords.

Content guidelines include addressing the receiver, having a clear opt out language and not using public URL shorteners. You can refer to the [CTIA guidelines](https://www.ctia.org/the-wireless-industry/industry-commitments/messaging-interoperability-sms-mms) for the current best practices.

In addition to that, there are considerations for each type of phone number you can purchase.

Long code numbers are commonly referred to as "local" numbers, and are the most common type. They are only suitable for person-to-person (P2P) messaging, meaning a casual two way conversation initiated by an actual user. They are limited to 1 message per second, but that should not be an issue if they are used as intended.

Toll free numbers have an area code that begins with an 8, and are less restrictive due to their nature. They can be used for application-to-person (A2P) messaging provided content meets the general guidelines. They are limited to sending 10 messages per second.

Short codes are 5 or 6 digit phone numbers that are allowed to send SMS and MMS when an user opts in by texting them. The messages that are sent via short codes have to respect pre-approved content. As a result, the procedure to get a short code in place can be slightly longer, but they have the best deliverability of all types of numbers. You can find more information about short codes at SignalWire [here](https://signalwire.com/blogs/product/short-codes-make-their-debut-at-signalwire).

### Carrier surcharges

Carriers have recently introduced a series of surcharges for SMS and MMS traffic, which are applied differently in each country. For example, the US have surcharges on short code messages, and Canada on long and toll free numbers. You can find the current list of surcharges on our [pricing page](https://signalwire.com/pricing/messaging).

## Receiving an SMS

To receive an SMS on one of your SignalWire numbers, you can use a variety of different methods.

The simplest way is... do nothing. Any message you receive will show up in the dashboard under "Usage". You might then want to list the messages you received using the [REST API](https://docs.signalwire.com/topics/laml-api/#api-reference-messages-list-all-messages).

In a more useful scenario, you will want to intercept the message so you can do something with it programmatically. Setting up a LaML bin like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>Thank you for contacting SignalWire!</Message>
</Response>
```

will result in a reply to each message received. `<Message>` supports other parameters, most notably `to` and `from` which allow you to send a reply to a different number than the original sender. You can find the documentation [here](https://docs.signalwire.com/topics/laml-xml/?xml#messaging-laml-message).

As usual, use your dashboard to set it as the messaging handler.

![SMS Handling Settings](/assets/set_sms_handler.png)

To handle messages programmatically, the best way is to set up your own web application. The following Flask app will reply in the same way as the above LaML bin, but allows you to do something useful with the `From` and `Body` fields.

```python
from flask import Flask, request
from signalwire.messaging_response import MessagingResponse
app = Flask(__name__)

@app.route('/')
def hello_world():
    from_number = request.args.get('From')
    message_body = request.args.get('Body')

    # do something useful with the parameters
    print(from_number, message_body)

    response = MessagingResponse()
    response.message('Hello from SignalWire!')
    return response.to_xml()
```

## Conclusions

SignalWire makes integrating SMS and MMS into your application fun and easy. Let us know what you build on our APIs!
