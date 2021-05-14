require 'signalwire/sdk'
require 'active_support/time'
require 'csv'

@client = Signalwire::REST::Client.new 'ProjectID', 'AuthToken', signalwire_space_url: 'YOURSPACE.signalwire.com'

calls = @client.calls.list(status: 'completed', end_time_after: (DateTime.now - 7.days).strftime('%a, %d %b %Y %H:%M:%S GMT'))

headers = ['CallSID','Date Created','Direction', 'Duration', 'End Time', 'From', 'To', 'Price']

calls.each do |record|
        CSV.open('AccountCalls.csv', 'w+') do |csv|
                csv << headers
                calls.each do |record|
                csv << [record.sid, record.date_created, record.direction, record.duration, record.end_time, record.from,record.to, record.price]
        end
end
end 
