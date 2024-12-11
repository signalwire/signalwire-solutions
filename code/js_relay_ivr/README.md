# Building a Basic IVR using SignalWire Communications APIs
​
This code will show you how you can use SignalWire's Communication APIs to build out a simple IVR phone system with Node.JS. Being the OG Geeks that we are, we'll be using the Tosche Station from the desert planet of Tatooine for this example. Once you have modified this code to point it at the correct phone numbers and departments, you should only then need to link the server that this lives on to your main phone number in your SignalWire Space and let it go from there.
​
## Getting Started and Connecting to SignalWire's APIs
​
This code example utilizes Node.JS, so you will need SignalWire's Node.JS SDK, which you can easily install by using NPM and inputting `npm install @signalwire/node`. The Node.JS SDK is good for getting up and running with our Communication APIs quickly. When using Node.JS, you will need to create a Consumer to communicate with the API. A consumer creates a long running process which allows you to respond to incoming requests and events in realtime. Consumers are great for automating much of the requests for the API, allowing you to focus on building your code. View the code snippet below to see how to connect and build a consumer. The only other items of information you will need is `yourProjectId` and `yourApiToken`, both of which can be found in your SignalWire Space.
​
```js
const {RelayConsumer} = require('@signalwire/node') 
const consumer = new RelayConsumer({ 
    project: 'yourProjectId',
    token: 'yourApiToken',
    onIncomingCall: async (call) => {
        const {successful} = await call.answer()
        if (!successful) {
            console.error('Answer Error')
            return
        }
```
Above, you can see how you can connect the SDK to SignalWire's Communication API and create a consumer. You'll also notice that the latter part of the code snippet creates an instance, telling the API what to do should an inbound call come through to your SignalWire Space. The next thing you want to do is configure your application to welcome the inbound customer verbally and instruct the API to collect the caller's response via digits. You can see that snippet below:
​
```js
const collect = {
            type: 'digits',
            digits_max: 1,
            text: 'Hello and Welcome to the Tatooine Tosche Station. If you are a new customer, please press one. If you are a returning customer and your power converter needs to be replaced, please press two. If a Jawa has stolen your power converter and you need it back, please press three.'
        }
        const prompt = await call.promptTTS(collect)
```
You now have your user input that was collected from the initial welcome script. From here, all you have to do is set up a phone tree that dials a specific department based off of what digit the caller inputed through an `if/else` statement or `switch`. In this example, we utilized the former. You will also want to change `mainOfficeNumber` to the phone number that the caller initially called into and the `departmentNumber` to the phone number of the department that you wish the call to be directed to.  Phone numbers can be purchased, both through [SignalWire's Communication APIs] in bulk (https://signalwire.force.com/help/s/article/API-Example-for-Purchasing-Numbers-in-Bulk) or through your SignalWire Space individually. Although not necessary, we've added an `if` statement to the end of each leg of this snippet which will report to the console in the event of a failed call.
​
```js
        if (prompt == 1) {
            const dialResult = await consumer.client.calling.dial({
                type: 'phone',
                from: 'mainOfficeNumber',
                to: 'departmentNumber',
            })
            const { successful, call} = dialResult
            if (!successful) {
                console.error('Dial Error')
                return
            }
        }
        else if (prompt == 2) {
            const dialResult = await consumer.client.calling.dial({
                type: 'phone',
                from: 'mainOfficeNumber',
                to: 'deparmentNumber',
            })
            const { successful, call} = dialResult
            if (!successful) {
                console.error('Dial Error')
                return
            }
        }
        else if (prompt == 3) {
            const dialResult = await consumer.client.calling.dial({
                type: 'phone',
                from: 'mainOfficeNumber',
                to: 'departmentNumber',
            })
            const { successful, call} = dialResult
            if (!successful) {
                console.error('Dial Error')
                return
            }
        
        }
        
    }
​
})
```
This code example is simply the foundation of an IVR in SignalWire's Communication APIs at its most basic form, however the IVR itself can be scaled up or down depending on the needs of your business easily and efficiently.

## Running the Application

If you wish to run the application locally, first load the `.env` file with `set -o allexport; source.env; set +o allexport`, and then run `npm install` followed by `npm start`.

We recommend running the application via Docker, by first building the image with `docker build -t relayivr` and then `docker run -it --rm --name relayivr --env-file .env relayivr`. 

You can just run `sh run_docker.sh` in your shell and the container will be built and started for you. 
​
## Get Started with SignalWire
​
If you would like to test this example out, you can create a SignalWire account and space [here](https://signalwire.com/signups/new?s=1).
​
Your account will be made in trial mode which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).
​
If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.
​
Please feel free to reach out to us on our Community Slack or create a Support ticket if you need further guidance!