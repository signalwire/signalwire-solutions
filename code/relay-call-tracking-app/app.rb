require "sinatra"
require "signalwire"

set :config, JSON.parse(File.read("config.json"))

get "/" do
  @config = settings.config
  erb :index
end

post "/route" do
  puts "from is #{params[:destination]}"
  puts "mapping is #{settings.config["mappings"]}"
  num = settings.config["mappings"].detect {|n| n[0] == params[:destination]}
  puts "num is #{num[1]}"
  num ? num[1] : settings.config["default"]
end

post "/place" do
  task = Signalwire::Relay::Task.new(
    project: ENV['SIGNALWIRE_PROJECT_KEY'],
    token: ENV['SIGNALWIRE_TOKEN'],
    host: ENV['SIGNALWIRE_HOST']
  )
  
  task.deliver(context: 'office', message: { foo: 'bar' })
end