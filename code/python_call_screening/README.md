# Call Screening System (with Python)

This code snippet implements a call screening system based on the concept of a blockList containing offending numbers. 

When a call comes in, the From number will be cross checked with the block list to see if it is one of the blocked numbers. If so, the call will hang up. If the number is not in the block list, the call flow moves on to the next segment. In this case, I have redirected to a LaML Bin. However, depending on your needs, this can point at a LaML bin, another webhook, or another part of the code within the same document. 

You will need the Flask framework and the SignalWire Python SDK downloaded.
https://flask.palletsprojects.com/en/1.1.x/installation/
https://docs.signalwire.com/topics/laml-api/#laml-rest-api-client-libraries-and-sdks-python

## Configuring the application

To set the block list, you can set the `BLOCKLIST` environment variable to a value of a comma-separated list of numbers. For example:

```
export BLOCKLIST=+15554433222,+15559988777
```

If you prefer not to use enviroment variables, you can set an additional number or demo URL as displayed in the code below with the number +15557778899
or the redirect path https://some_redirect_url.

```
return os.getenv('BLOCK_LIST', '+1555778899').split(',')
```

 
```
response.redirect(os.environ.get('REDIRECT_PATH', 'https://some_redirect_url'))
```

To run the application, execute `export FLASK_APP=app.py` then run `flask run`.

## Testing locally

You may need to use a tunnel for testing this code – we recommend [NGROK](https://ngrok.com/).

