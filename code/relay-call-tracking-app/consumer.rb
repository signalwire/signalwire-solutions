require "signalwire"
require 'net/http'

Signalwire::Logger.logger.level = ::Logger::DEBUG

class SimpleConsumer < Signalwire::Relay::Consumer
  contexts ['office']

  def on_incoming_call(call)
    call.answer

    uri = URI(API_URL + '/route')
    res = Net::HTTP.post_form(uri, 'destination' => call.to)

    call_handler = call.connect [[{ type: 'phone', params: { to_number: res.body, from_number: call.from, timeout: 30 } }]]
    call_handler.call.wait_for_ended

    call.hangup
  end

  def on_task(task)
    logger.debug "Received #{task.message}"
  end
end

SimpleConsumer.new.run

ruby simple_consumer.rb