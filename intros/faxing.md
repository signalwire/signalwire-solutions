# Faxing with SignalWire

Faxes, despite their venerable age as a technology, still have a very important place in today's workplace. SignalWire makes it as easy as possible to send and receive faxes through our APIs.

## Receiving a fax via LaML

Once you have purchased a phone number from your dashboard (more information [here](/intros/signalwire_101), you should prepare a simple LaML bin to handle reception. The `<Receive>` verb is used to accept incoming faxes. We will be using the simplest possible syntax in our example, but you can find more information [here](https://docs.signalwire.com/topics/laml-xml/?xml#fax-laml-receive).

For example, you can set specific storage options, request that the file be sent to your server directly, or handle different formats. Our example below will notify your webhook of a received fax.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Receive action="https://yoururl.com/webhook"/>
</Response>
```

Next, we will set up our phone number to receive calls as faxes, and point it at the LaML bin we set up earlier.

![Set up number to handle fax](/assets/handle_fax.png)

Now, every time a fax is sent to your phone number, the above endpoint will receive a POST with the information including a `MediaUrl` parameter with a link to the fax file.

## Sending a fax using the LaML REST API

It is also very simple to send a fax using our APIs. All you need is an HTTP endpoint that can serve the necessary file, and you can find the full parameter list [here](https://docs.signalwire.com/topics/laml-api/#api-reference-faxes-send-a-fax).

Here is an example on how to send a fax in Ruby. The `status_callback` parameter is an URL that will receive information on the progress of the sending attempt.

```ruby
client = Signalwire::REST::Client.new ENV['SIGNALWIRE_PROJECT'], ENV['SIGNALWIRE_TOKEN'], signalwire_space_url: ENV['SIGNALWIRE_SPACE']

resp = client.fax.faxes
  .create(
    from: '+15556677888',
    to: '+17774433222',
    status_callback: 'https://yoururl.com/webhook',
    media_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  )

  puts resp.inspect
```

## Conclusions

Despite their being an "ancient" technology, faxes still have a very real place in today's workplace. SignalWire makes it as easy as possible to send and receive faxes in an automated fashion.