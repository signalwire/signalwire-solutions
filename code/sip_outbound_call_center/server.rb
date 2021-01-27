require 'signalwire/sdk'
require 'sinatra'

def place_call(to_number)
  client = Signalwire::REST::Client.new ENV['SIGNALWIRE_PROJECT_KEY'], ENV['SIGNALWIRE_TOKEN'], signalwire_space_url: ENV['SIGNALWIRE_SPACE']

  call = client.calls.create(
    url: ENV['APP_DOMAIN'] + '/join',
    to: to_number,
    from: ENV['FROM_NUMBER']
  )
end

def enter_conference
  response = Signalwire::Sdk::VoiceResponse.new do |response|
    response.dial do |dial|
      dial.conference('Room 1234')
    end
  end
  response.to_s
end

get '/' do 
  @domain = ENV['SIP_CLIENT_DOMAIN']
  erb :index
end

post '/start' do
  place_call(params[:to_number])
  sip_target = "sip:#{params[:to_sip]}@#{ENV['SIP_CLIENT_DOMAIN']}"
  puts sip_target
  place_call(sip_target)
  'ok'
end

post '/join' do
  enter_conference
end