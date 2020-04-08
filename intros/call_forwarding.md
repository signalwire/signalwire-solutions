# Call forwarding with SignalWire

Remote work has become even more important in this day and age. You might have wondered how you could have a phone number to give out to your customers, that is not your personal mobile. You could even want to point the number back at your office after the remote work period has passed.

First of all, we will register for a new SignalWire account. Let’s go to the home page and click on Sign Up in the top right.

![SignalWire Home Page](/assets/sign_up.png)

You will receive an email with a confirmation link, and by clicking it you will end up on the account setup page. The first field to fill in is the Space name. A SignalWire Space is your personal domain to which all services are tied.
Make sure you fill in all of the sign up fields.

![SignalWire Sign Up](/assets/space_name.png)

Once we are signed up, we will find ourselves on the Dashboard, the command center of your SignalWire account.

Your first step will be setting up a Project. They are used to group up resources according to your preference, such as by customer account, by geographical region, or any other classification.

![New Project](/assets/new_project.png)

To set up an inbound phone call, we will need two elements: a phone number, and a LaML bin to handle the call.
Let’s start from the LaML bin. Click on `LaML`, then pick the `Bins` entry from the menu, and hit `New`.

LaML is our XML-flavored markup language, and each document describes a behavior for your call.

Documentation on LaML is available [on the SignalWire website](https://docs.signalwire.com/topics/laml-xml/#laml-xml-specification).

The following LaML will result in all calls being forwarded to the number you specify. The example uses a Washington weather service, but you would replace the number with your personal phone.

{% gist 62a8ffe5ee07f50aa901c0cad6c778ad %}

You will notice a specific tag being used in this document, `{{From}}` as the value of the `callerId` property. It is an advanced feature that allows every incoming call to be forwarded to you with the correct caller ID.

Next, you will need a phone number. Click “Phone numbers”, hit “New”, and pick a number you like. We support searching by area code and specific strings of text. A local number will be best for your usage. This will be the phone number you hand out to people.

![Pick Phone Number](/assets/pick_number.png)

Now we have two more steps to go through: the first is pointing our new phone number to the LaML bin we created earlier, and we will need to verify your personal phone number.

We will quickly go back to the LaML page and copy the bin’s URL, then set this as the handler for the number.

![Copy Bin URL](/assets/copy_bin_url.png)

Click “Edit Settings” on the phone number detail page, set the handler as “LaML Webhooks, and put your URL in the “When a call comes in:” field, then hit Save.

![Set Bin](/assets/set_bin.png)

Trial accounts are limited to interacting with verified phone numbers, both inbound and outbound. You can also add a credit card to your account and deposit some credit to exit trial mode.

Let’s quickly get a number verified by hitting “Phone Numbers” then picking “Verified”. Just add a new number, and put in your own cell phone. You will receive a phone call that will give you a six digit code, which you can simply enter in the form.

![Verify Number](/assets/verify_number.png)

Now, any time you or someone else places a call to the DID you bought, it will be forwarded to your personal phone. To change the destination, just edit the LaML document.
