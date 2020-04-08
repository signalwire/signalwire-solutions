# SignalWire 101

Welcome! My name is Luca, and I am the lead solutions architect at SignalWire. This post marks the beginning of a series that will take us on a trip through all of SignalWire’s features and offerings.

Today, we will be going through a crash course that will have us receiving your first phone call on your SignalWire account.

First of all, we will register for a new SignalWire account. Let’s go to the home page and click on Sign Up in the top right. Enter your email and we are off to the races!

![SignalWire Home Page](/assets/sign_up.png)

You will receive an email with a confirmation link, and by clicking it you will end up on the account setup page. The first field to fill in is the Space name. What is a Space, you will ask? It is your personal SignalWire domain to which all services are tied.
The rest are just the usual sign up fields.

![SignalWire Sign Up](/assets/space_name.png)

Once we are signed up, we will find ourselves on the Dashboard, the command center of your SignalWire account.

Your first step will be setting up a Project. They are used to group up resources according to your preference, such as by customer account, by geographical region, or any other classification.

![New Project](/assets/new_project.png)

To set up an inbound phone call, we will need two elements: a phone number, and a LaML bin to handle the call.
Let’s start from the LaML bin. Click on `LaML`, then pick the `Bins` entry from the menu, and hit `New`.

You might be wondering what LaML is. It is our XML-flavored markup language, and each document describes a behavior for your call. For example, in this tutorial we will be creating an “Hello World” document that will just say that phrase using text-to-speech.

Documentation on LaML is available [on the SignalWire website](https://docs.signalwire.com/topics/laml-xml/#laml-xml-specification).

![New LaML Bin](/assets/new_laml_bin.png)

The `<Say>` tag is the relevant part here. It has many  options, and support for quite a few languages. We will stay with the defaults for now, but you can find more information [here](https://docs.signalwire.com/topics/laml-xml/#voice-laml-say).

Here is how your bin contents should look like:

{% gist b0e0100acbba10acb1b459c78acce878 %}

Save your LaML bin and one side of our call is set up.

Next, you will need a phone number. Click “Phone numbers”, hit “New”, and pick a number you like. We support searching by area code and specific strings of text. I recommend starting with a local number.

![Pick Phone Number](/assets/pick_number.png)

Now we have two more steps to go through: the first is pointing our new phone number to the LaML bin we created earlier, and after we do that we will need to verify another number to be able to dial in.

We will quickly go back to the LaML page and copy the bin’s URL, then set this as the handler for the number

![Copy Bin URL](/assets/copy_bin_url.png)

Click “Edit Settings” on the phone number detail page, set the handler as “LaML Webhooks, and put your URL in the “When a call comes in:” field, then hit Save.

![Set Bin](/assets/set_bin.png)

Trial accounts are limited to interacting with verified phone numbers, both inbound and outbound. You can also add a credit card to your account and deposit some credit to exit trial mode.

Let’s quickly get a number verified by hitting “Phone Numbers” then picking “Verified”. Just add a new number, and put in your own cell phone. You will receive a phone call that will give you a six digit code, which you can simply enter in the form.

![Verify Number](/assets/verify_number.png)

It is now time to test our setup: using the verified phone, place a call to the DID you bought. You will be greeted with the familiar words all developers like to hear, “Hello World!”.
