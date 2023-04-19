require 'dotenv/load'
require 'sinatra'
require 'faraday'
require "sinatra/reloader" if development?

set :bind, '0.0.0.0'


# Utility method to perform HTTP requests against the SW Video API
def api_request(payload, endpoint)
  conn = Faraday.new(
    url: "https://#{ENV['SIGNALWIRE_SPACE']}",
    headers: {'Content-Type' => 'application/json'}
  )
  conn.request :authorization, :basic, ENV['SIGNALWIRE_PROJECT_KEY'], ENV['SIGNALWIRE_TOKEN']

  response = conn.post("/api/video/#{endpoint}") do |req|
    req.headers['Content-Type'] = 'application/json'
    req.body = payload.to_json
  end

  JSON.parse(response.body)
end

# Request a token with simple capabilities
def request_token(room, user = nil)
  payload = {
    room_name: room,
    user_name: user.nil? ? "user#{rand(1000)}" : user,
    permissions: [
      "room.self.audio_mute",
      "room.self.audio_unmute",
      "room.self.video_mute",
      "room.self.video_unmute",
      "room.playback"
    ]
  }
  result = api_request(payload, 'room_tokens')
  result['token']
end

# Create a room to join
def create_room(room)
  payload = {
    name: room,
    display_name: room,
    max_participants: 5,
    delete_on_end: false
  }
  api_request(payload, 'rooms')
end

get '/' do
  @room = params[:room] || "room_#{rand(1000)}"
  @user = params[:user] || "user_#{rand(1000)}"

  @room_url = "#{request.base_url}?room=#{@room}"

  create_room(@room)
  @token = request_token(@room, @user)
  erb :index
end