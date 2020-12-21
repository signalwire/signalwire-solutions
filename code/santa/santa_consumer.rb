# coding: utf-8
# frozen_string_literal: true
require "signalwire"
require "dotenv/load"

require_relative 'santa_bot'

Signalwire::Logger.logger.level = ::Logger::DEBUG

class SantaConsumer < Signalwire::Relay::Consumer
  contexts [ENV['CONTEXT']]

  def on_incoming_call(call)
    lang = "en-US-Wavenet-B"
    gender = "male"

    call.answer if !call.answered?
    sleep 1
    
    obj = SantaBot.new("santa_audio.json", call.from)

    prompt = obj.run
    logger.info "updating prompt to #{prompt}"

    while call.active?

      collect_speech = {
        "initial_timeout": 10.0,
                        "speech": {
                                    "end_silence_timeout": 1.0,
                                   "language": "en-US",
                                   "hints": ["denoise=true", "reset"] + obj.hints
                                  }
      }

      args = []

      if prompt
        prompt.each { |msg|
      
          if (msg.downcase.match("http"))
            args.push({type: 'audio', params: {url: msg}})
          else
            args = args.push({ type: 'tts', params: { text: msg, "language": lang , "gender": gender} })
          end
          
        }
      end
      
      if !obj.done
        result = call.prompt(collect_speech, args)
      else
        result = nil
      end
      
      if (result and result.successful)
        logger.info "heard #{result.result}"
        prompt = obj.run result.result.downcase
      end

      obj.save

      if prompt
        logger.info "updating prompt to #{prompt}"
        if obj.done
          prompt.each { |msg|
            if (msg.downcase.match("http"))
              call.play_audio msg
            else
              call.play_tts text: msg, language: lang, gender: gender
            end
          }
        end
      end

      if obj.playfile
        logger.info "#{call.from} playing " + obj.playfile
        call.play_audio obj.playfile
        obj.reset
        obj.save
        call.hangup
      end

      if obj.done
        call.hangup
      end      
    end
  
  rescue StandardError => e
    logger.error e.inspect
    logger.error e.backtrace
  
  end

  def on_incoming_message(message)
    logger.info "Received message from #{message.from}: #{message.body}"

    if message.body.downcase == "call me"
      call = client.calling.new_call(from: ENV['FROM_NUMBER'], to: message.from)
      call.dial

      client.messaging.send(from: ENV['FROM_NUMBER'], to: message.from, context: ENV['context'], body: "OK!")
      on_incoming_call call

      return 
    end
    
    obj = SantaBot.new("santa.json", message.from)
    prompt = obj.run message.body.downcase
    obj.save

    if prompt
      prompt.each { |msg|
        result = client.messaging.send(from: ENV['FROM_NUMBER'], to: message.from, context: ENV['context'], body: msg)
      }
    end

    if obj.playfile
      logger.info "Calling #{message.from} and playing " + obj.playfile
      call = client.calling.new_call(from: ENV['FROM_NUMBER'], to: message.from)
      call.dial
      call.play_audio obj.playfile
      call.hangup
      obj.reset
      obj.save
    end

    
  rescue StandardError => e
    logger.error e.inspect
    logger.error e.backtrace
  end

  def on_message_state_change(message)
    logger.info "Received state change: #{message.id} #{message.state}"
  rescue StandardError => e
    logger.error e.inspect
    logger.error e.backtrace
  end
end

SantaConsumer.new.run