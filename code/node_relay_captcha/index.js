/*
 * Copyright (c) 2020, SignalWire INC
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 *
 * * Neither the name of the original author; nor the names of any contributors
 * may be used to endorse or promote products derived from this software
 * without specific prior written permission.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED.	 IN NO EVENT SHALL THE COPYRIGHT OWNER
 * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**

   Relay example: Voice Captcha and built-in Lenny module.
   Pass the test, get whitelisted and call the mapped number, fail and be doomed to Lenny for 2 weeks.
   Change your mind mid call? dial ** to transfer to Lenny.

**/
const {
  RelayConsumer
} = require('@signalwire/node');
const storage = require('node-persist');
const config = require('config');

async function lenny(call, db) {
  var aidx = -1;
  var ridx = 0;
  var collect_params = {
    type: 'speech',
    end_silence_timeout: 1.0,
    media: [{
      type: 'audio',
      url: ""
    }]
  }

  function getUrl(what) {
    return CONFIG.lennyConfig.soundBase + '/' + CONFIG.lennyConfig[what];
  }

  collect_params.media[0].url = getUrl("background");

  async function prompt(path) {
    console.log("Prompting with: ", path);
    await call.playAudio({
      url: path
    });
    return await call.prompt(collect_params);
  }

  async function getAttention() {
    var path;

    console.log("Getting Attention");

    if (aidx == -1) {
      path = getUrl("greeting");
      aidx++;
    } else {
      path = CONFIG.lennyConfig.soundBase + '/' + CONFIG.lennyConfig.attentionGetters[aidx++];
    }

    if (aidx > CONFIG.lennyConfig.attentionGetters.length - 1) {
      aidx = 0;
    }

    return await prompt(path);
  }

  async function getResponse() {
    console.log("Getting Response");

    var path = CONFIG.lennyConfig.soundBase + '/' + CONFIG.lennyConfig.responseGetters[ridx++];

    if (ridx > CONFIG.lennyConfig.responseGetters.length - 1) {
      ridx = 0;
    }

    return await prompt(path);
  }

  while (call.active) {
    const result = await getAttention();

    if (result && result.successful) {
      console.log("heard " + result.result);

      while (call.active) {
        const rresult = await getResponse();

        if (result && rresult.successful) {
          console.log("heard " + result.result);
        } else {
          // Go back to getting attention
          break;
        }
      }
    }
  }

  await call.hangup();

  return true;
}



async function completeCall(call) {
  var dial = await call.connect({
    type: 'phone',
    to: CONFIG.numberMap[call.to],
    from: call.from,
    timeout: 30
  });

  if (dial.successful) {
    console.log("Waiting for call to end");

    dial.call.dialed = [];
    dial.call.digitParser = function(digit) {
      var self = dial.call;

      self.dialed.push(digit);
      while (self.dialed.length > 2) {
        self.dialed.shift();
      }
      if (self.dialed.length == 2) {
        var str = self.dialed.join("");
        console.log("code", str);

        if (str === "**") {
          // You suck!
          call.db.scammer = true;
          call.db.human = false;
          self.hangup();
        }
      }
    }

    dial.call.on('detect.update', (call, params) => {
      if (params.detect.type === "digit") {
        dial.call.digitParser(params.detect.params.event);
      }
    });

    const detectAction = await dial.call.detectAsync({
      type: "digit",
      timeout: 0
    });

    await dial.call.waitForEnded();
    console.log("Call has ended");
  } else {
    console.log("Call has failed");
    await call.tts(CONFIG.general.callFailureMessage);
  }

  if (!call.db.scammer) {
    await call.hangup();
  }

  return true;
}

async function handleCall(call) {

  const recordAction = await call.recordAsync({
    direction: "both",
    initial_timeout: 10,
    end_silence_timeout: 0,
    stereo: true
  })
  call.db.recordings.push({
    url: recordAction.url,
    uuid: recordAction.controlId
  });
  console.log("recording to " + recordAction.url);

  if (!call.db.human && !call.db.scammer && CONFIG.general.mode === "captcha") {
    await captcha(call, call.db);
  }

  if ((call.db.human || CONFIG.general.mode === "screen") && !call.db.scammer) {
    console.log("Forwarding From: " + call.from + " To: " + CONFIG.numberMap[call.to]);
    await completeCall(call);
    if (call.db.scammer) {
      console.log(call.from + " Has been tagged as a scammer.");
    }
  }

  if (call.db.scammer) {
    if (CONFIG.general.enableLenny) {
      console.log(call.from + " Has been sent to lenny.");
      await lenny(call);
    } else {
      console.log(call.from + " Has been dismissed.");
      await call.tts(CONFIG.general.scammerMessage);
      await call.hangup();
    }
  }

  return true;
}

async function captcha(call) {
  var tries = CONFIG.general.captchaTries;
  var loops = 3;

  var hints = ["denoise=true"];

  // add all possible answers to hints so it is more likely to hear numbers
  for (i = 0; i <= 20; i++) {
    hints.push(i);
  }

  var collect_params = {
    type: 'both',
    digits_max: 2,
    digit_timeout: 1.0,
    digits_terminators: '#',
    end_silence_timeout: 1.0,
    speech_hints: hints,
    media: [{
      type: 'tts',
      text: "",
      language: CONFIG.tts.lang,
      gender: CONFIG.tts.gender
    }]
  }

  var msg = CONFIG.general.introMessage + ", powered by SignalWire: ";

  await call.tts(msg);

  while (call.active && call.db.scammer == false && tries > 0 && loops > 0) {
    var rand1 = Math.random() * 10 + 1 << 0
    var rand2 = Math.random() * 10 + 1 << 0
    var answer = rand1 + rand2

    loops--;
    collect_params.media[0].text = "What is " + rand1 + " plus " + rand2 + '?';;
    const result = await call.prompt(collect_params)

    if (result && result.successful) {
      console.log("heard " + result.result);

      var regex = new RegExp(answer, 'g');

      if (result.result.match(regex)) {
        await call.tts(CONFIG.general.humanMessage);
        call.db.human = true;
        call.db.scammer = false;
        break;
      } else {
        tries--;
        if (tries == 0) {
          call.db.scammer = true;
          call.db.human = false;
          break;
        } else {
          await call.tts(CONFIG.general.wrongAnswerMessage + " " + "I will give you " +
            tries + " more " + (tries > 1 ? "tries" : "try"));
        }
      }
    } else if (result) {
      console.error("Bad result");
      await call.tts(CONFIG.general.missedDetectionMessage);
    }
  }

  return true;
}

async function callInit(call) {

  // TTS helper method
  call.tts = async function(params_in) {
    var params = params_in;

    if (typeof(params_in) === "string") {
      params = {
        text: params_in
      };
    }

    params.language = CONFIG.tts.lang;
    params.gender = CONFIG.tts.gender;
    console.log("speaking", params);

    return call.playTTS(params);
  }

  // Load persistent storage
  call.db = await storage.getItem(call.from);
  if (!call.db) {
    await storage.setItem(call.from, {
      human: false,
      scammer: false,
      recordings: []
    });
    call.db = await storage.getItem(call.from);
  }
}

const consumer = new RelayConsumer({
  project: process.env.SIGNALWIRE_PROJECT_KEY || CONFIG.SW.SIGNALWIRE_PROJECT_KEY,
  token: process.env.SIGNALWIRE_TOKEN || config.SW.SIGNALWIRE_TOKEN,
  contexts: [process.env.SIGNALWIRE_CONTEXT] || config.SW.SIGNALWIRE_CONTEXT,
  
  ready: async ({ client }) => {
    client.__logger.setLevel(client.__logger.levels.DEBUG)
  },
  
  teardown: (consumer) => {
    console.log('Consumer teardown. Cleanup..')
  },
  
  onIncomingCall: async (call) => {
    console.log('Inbound call', call.id, call.from, call.to, CONFIG.numberMap[call.to]);
    const answerResult = await call.answer();

    if (!answerResult.successful) {
      console.error('Error during call answer')
      return;
    }

    await callInit(call);
    await call.playSilence(1);

    console.log("New call from " + call.from, call.db);

    await handleCall(call);
    await storage.setItem(call.from, call.db);
    await call.hangup()
  }
})

const CONFIG = config.get('config');

console.log("config", CONFIG);

(async () => {
  await storage.init({
    logging: true,
    ttl: 86400 * 1000 * 14,
    dir: '/opt/node-persist',
  });
})();

console.log("starting application");
consumer.run();