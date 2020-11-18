using System;
using Microsoft.AspNetCore.Mvc;
using Twilio.AspNet.Core;
using Twilio.TwiML;
using Twilio.TwiML.Voice;

namespace IvrDemo.Controllers
{
   [Route("api/[controller]")]
   public class VoiceController : TwilioController
   {
       // GET: api/voice
       [HttpGet]
       public TwiMLResult Get()
       {
          var response = new VoiceResponse();
          var gather = new Gather(action: new Uri("/api/voice"), numDigits: 1, timeout: 5);
          gather.Say("Please press 1 for sales or 2 for support.");
          response.Append(gather);
          return TwiML(response);
       }

       // POST: api/voice
       [HttpPost]
       public TwiMLResult Post()
       {
          var digits = Request.Form["Digits"];
          var response = new VoiceResponse();

          if (digits == "1") {
            response.Say("Connecting you to sales");
            var dial = new Dial();
            dial.Number("+15554433222");
            response.Append(dial);
          } else if (digits == "2") {
            response.Say("Connecting you to support");
            var dial = new Dial();
            dial.Number("+15559988777");
            response.Append(dial);
          } else {
            response.Say("Sorry, that choice is invalid.");
            response.Redirect(method: Twilio.Http.HttpMethod.Get, url: new Uri("/api/voice"));
          }
          
          return TwiML(response);
       }
   }
}