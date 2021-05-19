# This code snippet is to list messages from your LaML logs filtered by from number
# It will then put the data into a dataframe and export to CSV.
# You MUST have pandas and datetime installed and imported for this to work.
from datetime import datetime
from signalwire.rest import Client as signalwire_client
import pandas as pd

client = signalwire_client("ProjectID", "AuthToken", signalwire_space_url = 'SpaceUrl')


# Lists messages from a particular number within a specific date range and from a number
messages = client.messages.list(date_sent_after=datetime(2021, 1, 1, 0, 0),
                               # date_sent_before=datetime(2021, 3, 1, 0, 0),
                               from_='+15552308945',
                               )

# Sets up an empty array
d = []

# Appends all data from messages into an array
for record in messages:
   d.append((record.from_, record.to, record.date_sent, record.status, record.sid))

print(d)

# Puts message log array into dataframe with headers for easier reading.
df = pd.DataFrame(d, columns=('From', 'To', 'Date', 'Status', 'MessageSID'))

print('dataframe')
print('\n')
print(df)

# Exports dataframe to csv, index=False turns off the indexing for each row
df.to_csv('messages.csv', index=False, encoding='utf-8')
