require 'dotenv/load'
require 'sinatra'
require 'faraday'
require 'json'
require "sinatra/reloader" if development?

set :bind, '0.0.0.0'

event_register = []

def api_request(payload, endpoint, method = :post)
  conn = Faraday.new(url: "https://#{ENV['SIGNALWIRE_SPACE']}/api/video/#{endpoint}")
  conn.request(:authorization, :basic, ENV['SIGNALWIRE_PROJECT_KEY'], ENV['SIGNALWIRE_TOKEN'])

  if method == :post
    response = conn.post() do |req|
      req.headers['Content-Type'] = 'application/json'
      req.body = payload.to_json
    end
  else
    response = conn.get() do |req|
      req.headers['Content-Type'] = 'application/json'
    end
  end

  JSON.parse(response.body)
end

# Request a token with simple capabilities
def request_token(room, user = nil)
  payload = {
    room_name: room,
    user_name: user.nil? ? "user#{rand(1000)}" : user,
    enable_room_previews: true,
    permissions: [
      'room.self.audio_mute',
      'room.self.audio_unmute',
      'room.self.video_mute',
      'room.self.video_unmute',
      'room.self.deaf',
      'room.self.undeaf',
      'room.self.set_input_volume',
      'room.self.set_output_volume',
      'room.self.set_input_sensitivity',
      'room.list_available_layouts',
      'room.set_layout',
      'room.hide_video_muted'
    ]
  }
  result = api_request(payload, 'room_tokens')
  result['token']
end

get '/' do
  erb :index
end

get '/moderator' do
  erb :moderator
end

get '/sdk' do
  erb :sdk
end

post '/token' do
  @user = "user_#{rand(1000)}"
  @room = 'squarespace-video-demo'

  @token = request_token(@room, @user)
  {token: @token}.to_json
end

post '/report' do
  data = JSON.parse(request.body.read)
  event_register << data
  {status: :ok}.to_json
end

get '/register' do
  @register = event_register
  erb :register
end