# Screen Calls & Record Voicemail with PHP & Slim

This example will show how you can easily use the [SignalWire PHP SDK](https://developer.signalwire.com/twiml/reference/client-libraries-and-sdks#php) to handle incoming calls, screen them, and record a voicemail if you do not want to speak with the caller at the current time. 

# Step by Step Code Walkthrough

We will start by defining our first route `/` which will handle the original inbound call. In this route, we will create a [Dial](https://developer.signalwire.com/twiml/reference/dial) verb using the `action` URL parameter to redirect to the `/voicemail` route when the **dialed call has ended**. We will then use the [Number](https://developer.signalwire.com/twiml/reference/number-noun) noun inside of Dial along with the `url` parameter which redirects to the `/screen` calls route **after** the dialed call is answered but **before** the dialed call is connected. In this example, we use an environment variable for the `to` number, but in practice, it would be best to replace this with the number you would like all calls forwarded to or a database that can locate the correct number necessary. 
```php
# when a call comes in to this route, we will dial the env variable To number
$app->post('/', function (Request $request, Response $response, $args) {
    # instantiate voice response 
    $laml = new VoiceResponse;

    # create a <Dial> verb with an action url that will redirect to the voicemail route 
    $dial = $laml->dial('', array('action' => '/voicemail', 'answerOnBridge' => true));

    # use <Number> noun inside of dial and use url to redirect to /screen call route 
    $dial->number(getenv('TO_NUMBER'), array('url' => '/screen'));

    # convert response to XML
    $xmlResponse = $response->withHeader('Content-type', 'application/xml');
    $xmlResponse->getBody()->write(strval($laml));
    return $xmlResponse;
});
```

If the dialed call is answered, we will next go to the `/screen` route. We will create a [Gather](https://developer.signalwire.com/twiml/reference/gather) with the `action` URL that will redirect to the `/connect` route when any key is pressed. We will play a short message for the callee that tells them the number of the caller and asks for input to decide whether to accept or send to voicemail. If no input is detected, we will hang up the call. When the dialed call ends, we will execute the `/voicemail` route as indicated in the action URL of the original dialed call. 
```php
# check if callee wants to accept call or send to voicemail 
$app->post('/screen', function (Request $request, Response $response, $args) {
    # instantiate voice response 
    $laml = new VoiceResponse;

    # get request parameters so that we can access the From number of the caller 
    $post = $request->getParsedBody();

    # create a <Gather> where we expect 1 digit to be pressed and if pressed
    # we will redirect to the /connect route 
    $gather = $laml->gather(array(
    'action' => '/connect',
    'numDigits' => 1,
    'timeout' => 5
    ));

    # play message stating the caller's number and prompt for input in order to connect the call 
    $message = "You have a call from: {$post['From']}";
    $gather->say("{$message}. Press any digit to accept the call.");

    # if no input is connected, we will hang up and redirect to the voicemail route 
    $laml->say('Hanging up');
    $laml->hangup();

    # convert response to XML
    $xmlResponse = $response->withHeader('Content-type', 'application/xml');
    $xmlResponse->getBody()->write(strval($laml));
    return $xmlResponse;
});
```

If the callee presses any key, we will use [Say](https://developer.signalwire.com/twiml/reference/say) to play a short message alerting the callee that they will be connected now. 
```php
# play message to tell the callee that they are being connected to the original caller
$app->post('/connect', function (Request $request, Response $response, $args) {
    # instantiate voice response 
    $laml = new VoiceResponse;

    # use TTS to alert callee of impending connection
    $laml->say('Connecting you');

    # convert response to XML
    $xmlResponse = $response->withHeader('Content-type', 'application/xml');
    $xmlResponse->getBody()->write(strval($laml));
    return $xmlResponse;
});
```

When the dialed call ends, we will redirect to the `/voicemail` route. We will first check if the `DialCallStatus` is `completed` (i.e. `answered` and not in need of voicemail) and if it is, we will hang up the call. If the `DialCallStatus` is anything other than `completed`, we will use [Say](https://developer.signalwire.com/twiml/reference/say) to play a voicemail prompt and [Record](https://developer.signalwire.com/twiml/reference/record) to record a message. The `action` URL in Record will redirect to the `/store` route when the recording is complete. 

```php
# this route will record a voicemail message 
$app->post('/voicemail', function (Request $request, Response $response, $args) {

    # instantiate voice response 
    $laml = new VoiceResponse;

    # get request parameters so we can check the dial call status 
    $post = $request->getParsedBody();

    # check if dial call status is completed 
    # if status is not completed, record a voicemail 
    if ($post['DialCallStatus'] != "completed") {
        # play a prompt for the caller 
        $laml->say('Please leave a message after the beep. Press the pound key when done.');
        # use <Record> verb to record a message and finish on #, redirect to /store route when done 
        $laml->record(array(
            'action' => '/store',
            'maxLength' => 15,
            'finishOnKey' => '#'
        ));
       
    } # if dial call status is completed (and therefore was answered), hang up the call 
      else {
        $laml->hangup();
    }

    # convert response to XML
    $xmlResponse = $response->withHeader('Content-type', 'application/xml');
    $xmlResponse->getBody()->write(strval($laml));
    return $xmlResponse;
});
```

Our final route is more of a placeholder that you can fill based on your business needs! In the `/store` route, you can use the HTTP request parameters to get the `recordingUrl`, `From`, `To`, or many other parameters. You can use this to store on a server, update your CRM, or even [send an SMS with the recording URL](https://developer.signalwire.com/apis/docs/recording-url-to-sms). If you don't want to do anything with the recording, you can replace this function with the code to [Hangup](https://developer.signalwire.com/twiml/reference/hangup) when the recording is complete instead. 
```php
# in this route, you can save the recording, upload it somewhere, send it via sms, etc
$app->post('/store', function (Request $request, Response $response, $args) {
    $post = $request->getParsedBody();

    // do something with the recording
    // saveRecordingSomehow($post['RecordingUrl'], $post['From'], $post['To']);
    $response->getBody()->write('');
    return $response;
});
```
# Running locally

Use `composer install` to install dependencies, then run `TO_NUMBER=+15558877444 php -S localhost:8080 -t public/`, of course replacing `TO_NUMBER` with your own number you want to have calls screened to.

You may need to use an SSH tunnel for testing this code if running on your local machine. – we recommend [ngrok](https://ngrok.com/). You can learn more about how to use ngrok [here](https://developer.signalwire.com/apis/docs/how-to-test-webhooks-with-ngrok). 

# Sign Up Here

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!
