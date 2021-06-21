//TOSCHE STATION IVR - TATTOOINE BRANCH

//Retreive and import the SignalWire SDK and access your specific project using your Project ID, Auth Token, and SignalWire Space URL.
const { RestClient } = require('@signalwire/node')
const client = new RestClient('6337485b-b7c0-4313-89f8-95922eca2e6e', 'PT3c2e1d57f11f717220bb2760652c60c39c543f5a49f0cd93', {signalwireSpaceUrl: 'brettsspace.signalwire.com'})

//Begin by building application and creating the main menu.
client.applications
    .create({
        friendlyName: 'Tosche Station Power Converter Emporium IVR'
    })
    .then(application => console.log(application.sid))
    .done();

app.post("/entry", (req, res, next) => {
    var response = new RestClient.LaML.Message();
    gather = response.gather({ timeout: 45, numDigits: 1, action: formatUrl('mainmenu')})
    gather.Message("Hello and Thank You for reaching out to the Tosche Station Power Converter and Droid Emporium! Reply 1 for Sales. Reply 2 for Support. Reply 3 for Billing. For all other issues, or if your droid or power converter got stolen by a Jawa, reply 4 to speak to our pest control services.")

    respondAndLog(res, response);
});

//The main switch that dictates the IVR and controls what is going to be texted to whom depending on the input from the customers. 
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
