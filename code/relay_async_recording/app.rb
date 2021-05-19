# frozen_string_literal: true

$LOAD_PATH.unshift(File.dirname(__FILE__) + '/../lib')
%w[
  bundler/setup
  signalwire
].each { |f| require f }

# Setup your ENV with:
# SIGNALWIRE_PROJECT_KEY=YOUR_SIGNALWIRE_ACCOUNT_ID
# SIGNALWIRE_TOKEN=YOUR_SIGNALWIRE_ACCOUNT_TOKEN
#
Signalwire::Logger.logger.level = ::Logger::DEBUG

class MyConsumer < Signalwire::Relay::Consumer
  contexts ['incoming']

  def setup
    @calls = []
  end

  def on_incoming_call(call)
    call.answer
    call.play_tts text: 'connecting you to the clock service'
    dial = call.connect [[{ type: 'phone', params: { to_number: '+12027621401', from_number: ENV['FROM_NUMBER'], timeout: 30 } }]]
    dial.call.wait_for_ending
    @calls[call.id] = call
    call.hangup
  end

  def on_task(task)
    call_handle = @calls[task.message['call_id']]
    if call_handle
      if task.message['action'] == 'start'
        call_recording = call_handle.record!(direction: :both)
        call_handle['recording_handle'] = call_recording
      else
        call_handle['recording_handle'].stop
      end
    end
  end

  
end

MyConsumer.new.run

# To send a task

# task = Signalwire::Relay::Task.new(
#   project: ENV['SIGNALWIRE_PROJECT_KEY'],
#   token: ENV['SIGNALWIRE_TOKEN'],
#   host: ENV['SIGNALWIRE_HOST']
# )

# task.deliver(context: 'incoming', message: { call_id: 'bar', action: 'start' })