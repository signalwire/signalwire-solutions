# Minimal Dotnet Core C# IVR example

This is a simple example of how to use the [SignalWire DotNet SDK](https://github.com/signalwire/signalwire-dotnet) with the [ASP.NET Core](https://dotnet.microsoft.com/learn/aspnet/what-is-aspnet-core) framework to develop an Interactive Voice Response (IVR).

It is based on the Dotnet Web API quickstart example and uses the MVC components to generate the LAML document and parse the responses.

## Running the example

To run the example locally, if you have the necessary DotNet Frameworks components installed, you can use `dotnet restore` followed by `dotnet run`. 

If you prefer running on Docker or you are getting started with DotNet, you can build your container with `docker build -t aspnetapp .`, then run it using `docker run -it --rm -p 3232:80 aspnetapp`.

After the application is running using one of the two methods, you can use your browser to go to [http://localhost:3232/api/voice](http://localhost:3232/api/voice) and see the sample XML being returned.

To test the application with SignalWire while running locally, we recommend using [ngrok](https://ngrok.com/) to create a tunnel. After setting that up, use the URL returned by the service as the webhook address in you SignalWire dashboard.

## Getting started with SignalWire

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide. It explains how to point a phone number you have purchased to a LAML webhook like the one provided by this application.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!
