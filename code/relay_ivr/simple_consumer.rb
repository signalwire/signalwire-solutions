require "signalwire"
require "dotenv/load"

Signalwire::Logger.logger.level = ::Logger::DEBUG

class SimpleConsumer < Signalwire::Relay::Consumer
  contexts ['incoming']

  def on_incoming_call(call)
    call.answer
    call.play_tts text: 'the quick brown fox jumps over the lazy dog'

    call.hangup
  end
end

SimpleConsumer.new.run

ruby simple_consumer.rb