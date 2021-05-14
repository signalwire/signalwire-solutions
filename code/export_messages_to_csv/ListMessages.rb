# For the following code to work, you will need to have Active Support and the SignalWire Ruby SDK installed.
require 'signalwire/sdk'
require 'active_support/time'
require 'csv'
# Replace these values with your Project ID, Auth Token, and Space URL. 
@client = Signalwire::REST::Client.new 'ProjectID', 'AuthToken', signalwire_space_url: 'YOURSPACE.signalwire.com'
# Choose what parameters you want to filter by - this example filters all messages sent after the specified date and specifies page size of 100. 
# Hour, minute, and second are left blank here. If you want to specify a time as well as date, you can fill these in. 
messages = @client.messages.list(page_size: 100, date_sent_after: Date.new(2021, 5, 1, 0, 0, 0))
print(messages)
# Create headers 
headers = ['MessageSID','Date Sent','Direction', 'From', 'To', 'Price', 'Status']
messages.each do |record|
        # Create and open a CSV
        CSV.open('AccountMessages.csv', 'w+') do |csv|
                # Insert headers first 
                csv << headers
                # For each record in messages, insert the data one by one into CSV. Make sure the order of parameters here matches the order of the headers, or the data will be mismatched. 
                messages.each do |record|
                csv << [record.sid, record.date_sent, record.direction, record.from,record.to, record.price, record.status]
        end
end
end
