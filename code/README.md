# Build Your Own IVR Message Tree using LaML

Many companies utlize IVRs for voice and navigating customers to the correct department for certain questions and services. However, the question remains: what is a convenient way to brief associates on the topic of a question in a convenient and efficient way? The answer is with a SMS-based IVR. Some businesses like Xfinity have already been implementing such a system and it is simpler than one would think it would be to do.

This application will allow you to build an IVR Message Tree, enabling customers to text a certain number and be routed to a specific office or specialist based off of their SMS replies. Written in JavaScript, this uses an example stemming from Star Wars Episode IV. We all know Luke wanted to go to the Toshi Station to pick up some power converters, and he wound up not being able to go. What could've happened if The Toshi Station had an SMS IVR? Let's explore what that would look like. 

## Configuration and Running the Application

To get started with the configuration of the application, first copy the   `env.example` file to a file named `.env` and fill in the information required.  If you wish to run the application locally, first load the `.env` file with `set -o allexport; source .3nv; set +o allexport`, then run `npm install` followed up with `npm start`.

Before going any further, I'd recommend heading to `http://localhost:3000` to view a test page.

## Code Snippets

First and foremost, we have to retrieve SignalWire's SDK and configure the application to your specific SignalWire project using your own `YourProjectID`, `YourApiToken`, and `YourUrl.signalwire.com `.

```js
const { RestClient } = require('@signalwire/node')
const client = new RestClient('YourProjectID', 'YourApiToken', {signalwireSpaceUrl: 'YourUrl.signalwire.com'})
```

From there, we begin by creating the initiatory entry route, where we ask for and gather the user's choice via a text message response. You can see the next code snippet below. As you can see, we are using a fictional business named the Toshi Station Power Converter Emporium. We are able to send an initial message which sends out the introductory SMS and allows someone to text the main phone number back with a digit between 1 and 4, depending on the department they wish to notify. The  `timeout` is set to 45 seconds, meaning the user has 45 seconds from when the introductory SMS is sent to respond with another SMS with a digit. 

```js
client.applications
    .create({
        friendlyName: 'Toshi Station Power Converter Emporium IVR'
    })
    .then(application => console.log(application.sid))
    .done();

app.post("/entry", (req, res, next) => {
    var response = new RestClient.LaML.Message();
    gather = response.gather({ timeout: 45, numDigits: 1, action: formatUrl('mainmenu')})
    gather.Message("Hello and Thank You for reaching out to the Toshi Station Power Converter and Droid Emporium! Reply 1 for Sales. Reply 2 for Support. Reply 3 for Billing. For all other issues, or if your droid or power converter got stolen by a Jawa, reply 4 to speak to our pest control services.")

    respondAndLog(res, response);
    });
```

Next, we see the body of the IVR, written in JavaScript, which is essentially a single loop, configured to forward text messages from the user to the associate related to the department. For any given option that the user chooses to be directed to, the user is able to respond with a message regarding what the issue the user is experiencing. This message then gets forwarded to the associate, as well as the phone number of the user so that the associate can text or call back whenever he or she is available. 

```js
app.post("/mainmenu", (req, res, next) => {
    var response = new RestClient.LaML.Message();

    switch (req.body.Digits) {
        case "1":
        gather = response.gather({timeout: 60})
        let ForwardMessage = gather.Message("In a few sentences, what would you like to speak to sales about?")
        client.message
        .create
            to: +19042048839
            from: +19043356229
            body: "MESSAGE FROM: " + from + ". MESSAGE READS: " + ForwardMessage + ". PLEASE RESPOND AS SOON AS POSSIBLE."

        case "2": 
        gather = response.gather({timeout: 60})
        let ForwardMessage = gather.Message("In a few sentences, what would you like to speak to support about?")
        client.message
        .create
            to: +19042892827
            from: +19043356229
            body: "MESSAGE FROM: " + from + ". MESSAGE READS: " + ForwardMessage + ". PLEASE RESPOND AS SOON AS POSSIBLE."
        
        case "3":
        gather = response.gather({timeout: 60})
        let ForwardMessage = gather.Message("In a few sentences, what would you like to speak to billing about?")
        client.message
        .create
            to: +19042892960
            from: +19043356229
            body: "MESSAGE FROM: " + from + ". MESSAGE READS: " + ForwardMessage + ". PLEASE RESPOND AS SOON AS POSSIBLE."
        
        case "4":
        gather = response.gather({timeout: 60})
        let ForwardMessage = gather.Message("I'm sorry to hear about your droid and/or powerconverter. We here at the Toshi Station think that Jawas are nothing but a bunch of scruffy-looking nerf herders. Would you like us to send out a Bounty Hunter? Respond 'Yes' or 'No'.")
           
//Here, we see a nested switch which shows how you can create multiple branching options from a single branch of the original phone tree.
            switch (req.ForwardMessage) {
                case "YES":
                    client.message
                    .create
                        to:
                        from: +19043356229
                        body: "Got it. A Mandalorian will meet you at the most retched hive of scum and villainy shortly"
                    client.message
                    .create
                        to: +19042894093
                        from: +19043356229
                        body: "A Jawa has stolen more of the Empire's property. Meet at Mos Eisley Cantina ASAP."

                case "NO":
                    client.message
                    .create
                        to:
                        from: +19043356229
                        body: "Got it. Your loss! Have a great day. Long Live the Empire!"
            }

        }
});
```
This snippet can be expanded on to result in as many different branches as your business requires it to have through the use of nested switches. By implementing this application, your business' employees can be briefed of the topic of a conversation before the conversation actually begins, shortening the overall amount of time the employee will be in communication with the customer and leading to a more streamlined problem resolution process. 

## Get Started with SignalWire

If you would like to test this example out, you can create a SignalWire account and space [here](https://signalwire.com/signups/new?s=1).

Your account will be made in trial mode which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need further guidance!