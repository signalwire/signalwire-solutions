# Multi-factor Authentication with SignalWire

Multi-factor authentication (MFA) is used to authenticate users of an application through the use of a secret token that is sent to them over SMS text or a voice call. It is commonly used for logging in to secure systems, but it is also gaining popularity as an one-time password (OTP) mechanism to authorize transactions or to sign documents and contracts.

SignalWire's [multi-factor authentication API](https://docs.signalwire.com/topics/relay-rest/#resources-multi-factor-authentication) provides a simple and secure flow to request and verify tokens via REST HTTP calls.

## Requesting a token via SMS

To request a token via SMS, the API requires a `to` parameter as the minimal payload to be sent in a CURL request to the `/api/relay/rest/mfa/sms` endpoint.

```sh
curl  https://your-space.signalwire.com/api/relay/rest/mfa/sms \
-X POST \
  -u 'YourProjectID:YourAuthToken' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "+15557788999"
  }'
```

This request will result in a message being delivered with `Your Personal Authorization Code is XXXXXX`.

If using SMS, you have the option of using SignalWire's outbound number which is already registered with the [Campaign Registry](https://signalwire.com/blogs/product/campaign-registry-a2p-10dlc-messaging). That way, you will not have to do your own registration. In case you would like to use a non-standard `message` parameter, however, you will need to provide your own `from` number, as SignalWire is only able to send the pre-approved text via its registered route.

## Requesting a token via voice

To request a token via voice call, again supply a `to` parameter as the minimal payload to be sent in a CURL request to the `/api/relay/rest/mfa/call` endpoint.

```sh
curl  https://your-space.signalwire.com/api/relay/rest/mfa/call \
-X POST \
  -u 'YourProjectID:YourAuthToken' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "+15557788999"
  }'
```

The above will place a call to the `to` number and read `Your Personal Authorization Code is XXXXXX` via text-to-speech to them.

## Optional parameters

There are a few parameters you can use to control the interaction and customize the API to your workflow.

- `to`: The E164 number to use as the destination (and only mandatory parameter).
- `from`: The E164 number from your account to use as the origin of the message. Campaign registry practices apply to this if using SMS.
- `message` : The message to read or send to the caller. The message must fit within one segment of 160 characters on `sms` (70 characters when using non-GSM symbols) if using SMS, or 500 characters including the token if using voice. Defaults to "Your Personal Authorization Code is:".
- `token_length`: The number of characters in the token, from 4 to 20. Defaults to 6.
- `max_attempts`: The number of allowed tries, including the first one, from 1 to 20. Defaults to 3.
- `allow_alphas`: Set to `true` or `false`, whether to include letters or just numbers in the token. Defaults to `false` (numbers only).
- `valid_for`: The number of seconds the token is considered valid for. Defaults to 3600, with a maximum of 604800 and a minimum of 0.

For example, the following CURL requests a token via SMS, specifying a `from` number, a custom message, allowing letters in the code, and asking for an eight character token. It also sets validity to two hours and allows for four retry attempts.

```sh
curl  https://your-space.signalwire.com/api/relay/rest/mfa/sms \
-X POST \
  -u 'YourProjectID:YourAuthToken' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "+15557788999",
    "from": "+5554433222",
    "message": "Here is your code: ",
    "allow_alpha": true,
    "token_length": 8,
    "valid_for": 7200,
    "max_attempts": 4
  }'
```

## Verifying a token

No matter which method you use to request the token, the application making the request will receive a JSON response similar to the following:

```json
{
  "id":"8630cc54-f6b2-45dd-b73b-cce28eb668d8",
  "success":true,
  "to":"+15557788999",
  "channel":"call"
}
```

The most important data in that JSON is the `id` field, which you need to save and use for the verification step. After the request, your user will have received the secret token over the chosen channel. Your application should present them with a way to input their code, and then use the `verify` endpoint to check the token.

Using the ID above, your request would look like the following. Note that the interaction ID is passed in via the URL.

```sh
curl  https://your-space.signalwire.com/api/relay/rest/mfa/8630cc54-f6b2-45dd-b73b-cce28eb668d8/verify \
-X POST \
  -u 'YourProjectID:YourAuthToken' \
  -H 'Content-Type: application/json' \
  -d '{
    "token": "<TOKEN-TO-CHECK>"
  }'
```

The response will be a simple JSON payload with a `success` boolean value.

```json
{
  "success": true
}
```

### Possible return values

The `verify` endpoint will return `"success": false` only if the token is actually wrong in respect to the interaction ID passed in.

It will return an HTTP code `404 Not Found` in the following cases:

- The interaction ID is incorrect
- The token has already been verified successfully once
- The maximum number of attempts has been reached
- The `valid_for` time has been exceeded and the token has expired

## Getting started

Sign up for a SignalWire account [here](https://m.signalwire.com/signups/new?s=1). It includes $5.00 of free credit to get you started.

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!