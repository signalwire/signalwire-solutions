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

        const collect = {
            type: 'digits',
            digits_max: 1,
            text: 'Hello and Welcome to the Tattooine Tosche Station. If you are a new customer, please press one. If you are a returning customer and your power converter needs to be replaced, please press two. If a Jawa has stolen your power converter and you need it back, please press three, or say bounty hunter.'
        }
        const prompt = await call.promptTTS(collect)

        if (prompt == 1) {
            const dialResult = await consumer.client.calling.dial({
                type: 'phone',
                from: '+19044417363',
                to: '+19046598495',
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
                from: '+19044417363',
                to: '+19044417370',
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
                from: '+19044417363',
                to: '+19044417372',
            })
            const { successful, call} = dialResult
            if (!successful) {
                console.error('Dial Error')
                return
            }
        
        }
        
    }

})