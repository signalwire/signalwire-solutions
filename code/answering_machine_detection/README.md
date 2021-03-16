# Answering Machine Detection

[write up goes here]
## Triggering calls

```ruby
client = Signalwire::REST::Client.new ENV['SIGNALWIRE_PROJECT_KEY'], ENV['SIGNALWIRE_TOKEN'], signalwire_space_url: ENV['SIGNALWIRE_SPACE']

  call = client.calls.create(
    url: ENV['APP_DOMAIN'] + '/start',
    to: params[:to],
    from: ENV['FROM_NUMBER'],
    machine_detection: "DetectMessageEnd"
  )
```

```bash
curl https://YOURSPACE.signalwire.com/api/laml/2010-04-01/Accounts/YOUR-PROJECT-ID/Calls.json \
  -X POST \
  --data-urlencode "Url=YOUR-WEBHOOK-URL" \
  --data-urlencode "To=DESTINATION-NUMBER" \
  --data-urlencode "From=CALLER-ID-FROM-SIGNALWIRE-ACCOUNT" \
  --data-urlencode 'MachineDetection=DetectMessageEnd' \
  -u "YOUR-PROJECT-ID:YOUR-TOKEN"
```

## Docker instructions

Copy `env.example` to `.env` and edit.

Build with `docker build . -t rubyamd`

Run with `docker run -it --rm -p 8080:8080 --name rubyamd --env-file .env rubyamd`