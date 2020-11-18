require 'sinatra'
require 'signalwire'

get '/forward' do
  response = Signalwire::Sdk::VoiceResponse.new do |response|
    response.say(message: "yo")
  end
  response.to_s
end