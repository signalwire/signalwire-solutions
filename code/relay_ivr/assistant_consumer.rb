require "signalwire"
require "dotenv/load"

Signalwire::Logger.logger.level = ::Logger::DEBUG

class AssistantConsumer < Signalwire::Relay::Consumer
  contexts ['incoming']

  def ready
    @humans = []
    @spammers = []
  end

  def on_incoming_call(call)
    call.answer
    record_handle = call.record! direction: "both", initial_timeout: 10, end_silence_timeout: 0, stereo: true

    if known_spammer?(call)
      handle_spammer(call)
    elsif known_caller?(call)
      connect_human(call)
    else
      handle_captcha(call)
    end

    record_handle.stop
    logger.info("Recorded to #{record_handle.url}")
  end

  def known_caller?(call)
    @humans.include?(call.from)
  end

  def known_spammer?(call)
    @spammers.include?(call.from)
  end

  def handle_captcha(call)
    tries = 0
    max_tries = 2
    is_spammer = false

    # we add all numbers to make it easier for ASR to hear them
    hints = (1..20).to_a

    call.play_tts text: "Hello! Prove to me you are a human."

    while tries < max_tries do
      first_num = rand(1..10)
      second_num = rand(1..10)

      input = call.prompt_tts(type: 'both',
        digits_max: 2,
        digit_timeout: 1.0,
        digits_terminators: '#',
        end_silence_timeout: 1.0,
        speech_hints: hints,
        text: "How much is #{first_num} plus #{second_num}?"
      )

      logger.info("caller said #{input.result}")
      
      if input.result.to_i == first_num + second_num
        is_spammer = false
        break
      else
        is_spammer =  true
        tries += 1
        remaining = max_tries - tries
        call.play_tts text: "That is wrong! You have #{remaining} more attempts" if (remaining) > 0
      end
    end

    if is_spammer
      @spammers << call.from
      handle_spammer(call)
    else
      @humans << call.from
      connect_human(call)
    end
  end

  def handle_spammer(call)
    # this is where we could have fun with them, but we will let them off easy this time
    call.play_tts text: "Not this time, spammer boy!"
    call.hangup
  end

  def connect_human(call)
    logger.info "this is where we will dial out to ourselves"
    call.play_tts text: "Connecting you to my master"
    call_handler = call.connect [[{ type: 'phone', params: { to_number: ENV['TO_NUMBER'], from_number: call.from, timeout: 30 } }]]
    activate_detector(call, call_handler.call)
    call.hangup
  end

  def activate_detector(call, other_call)
    detect = other_call.detect_digit(digits: "12", timeout: 120)

    if detect.result == "1"
      call.play_tts text: "Today is #{Time.now.strftime("%A")}"
    elsif detect.result == "2"
      # we might be wanting to save the person to a database
      other_call.play_tts text: "Number saved to database."
    end
    other_call.wait_for_ended
  end
end

AssistantConsumer.new.run

# ruby assistant_consumer.rb