# List Messages to CSV with All SignalWire SDKs

These snippets show how you can use SignalWire's API to filter the messages in your project by a number of parameters and then insert the message data into a CSV for your own record keeping. Walkthroughs will be provided in further detail below as the steps and methods vary with each language. 


You can read more about how this is done in our API documentation here:


[https://docs.signalwire.com/topics/laml-api/#api-reference-messages-list-all-messages](https://docs.signalwire.com/topics/laml-api/#api-reference-messages-list-all-messages)


The possible parameters that you fan filter by are `DateSent`, `Status`, `To`, `From`, and `PageSize`. 


# List Messages to CSV in Python 


## For the following code to work, you will need to have pandas, datetime, and the SignalWire Python SDK installed. 

Read about the different ways to install pandas here: [https://pandas.pydata.org/docs/getting_started/install.html]()


Read about datetime and how to install using pip here: [https://pypi.org/project/DateTime/]()

Read about the SignalWire Python SDK and how to install here: [https://docs.signalwire.com/topics/laml-api/#laml-rest-api-client-libraries-and-sdks-python]()

## First, we need to import the necessary resources. 
In this example, that is datetime, pandas, and the SignalWire Client. We also need to instantiate the SignalWire client using the project ID, auth token, and space URL. 

```python
from datetime import datetime
from signalwire.rest import Client as signalwire_client
import pandas as pd

client = signalwire_client("ProjectID", "AuthToken", signalwire_space_url = 'SpaceURL')
```


## Next, we need to choose what parameters we'd like to filter by.
In this example, I have included how to filter by a date range and from number. Start Time is a datetime object where the order for the arguments is Year, Month, Date, Hour, Minute, Seconds. You can leave hour, minute, and seconds at 0, unless you have a specific time of day you would like to filter by. 

For months Jan - September, A slight change was made because python version (3.9) does not support leading 0's in datetime anymore. You must use the 0o prefix for octal literals now. That is reflected below in the code. If your version doesn’t include that limitation, you can switch it back to 01 or whatever month you need. 

```python

messages = client.messages.list(date_sent_after=datetime(2021, 1, 1, 0, 0),
                               # date_sent_before=datetime(2021, 3, 1, 0, 0),
                               from_='+15552308945',
                               )

```

## We now need to insert the data from messages into an array. 
Here we set up an empty array. This will contain all of the data that we will gather from the messages. We can loop through messages and append each of the following parameters to our empty array: `form_formatted`, `to_formatted`, `date_sent`, `status`, and `sid`. 

You can expand this to include as many or as few parameters as you'd like. To see all of the parameters returned in the JSON response, you can view our API documentation here: [https://docs.signalwire.com/topics/laml-api/#api-reference-messages-list-all-messages](https://docs.signalwire.com/topics/laml-api/#api-reference-messages-list-all-messages)

After that, we print the array so that we can see what we have inserted for debugging purposes. 

```python
d = []

# Appends all data from messages into an array
for record in messages:
   d.append((record.from_, record.to, record.date_sent, record.status, record.sid))

print(d)

```
## Next we create a dataframe and export it to CSV. 
The next section of this code is to create a dataframe using pandas with column name headers. It's important to make sure that the order of the headers matches the order of the parameters you inserted into the array above. If you choose to add more or remove parameters, make sure to double check that the order matches or your data will be mismatched in the CSV. 

We then print the dataframe for debugging purposes and export the dataframe to csv. Using the parameter index=False turns off the indexing for each row. You can rename messages.csv to be as specific or general as you'd like. 


```python
df = pd.DataFrame(d, columns=('From', 'To', 'Date', 'Status', 'MessageSID'))

print('dataframe')
print('\n')
print(df)

df.to_csv('messages.csv', index=False, encoding='utf-8')
```



# List Messages to CSV in PHP


## For the following code to work, you will need to have the SignalWire PHP SDK installed. 


Read about the SignalWire PHP SDK and how to install here: [https://docs.signalwire.com/topics/laml-api/#laml-rest-api-client-libraries-and-sdks-php]()

You will also need to make sure that the vendor/autoload.php path points to the correct location in your computer, as we can’t determine that for you. However, if you want to run this script exactly, install the SDK from within the folder that contains this PHP script.

## First, we need to import the necessary resources. 
In this example, that just means we need to point to the correct path of the vendor autoload file on your computer. We also need to instantiate the SignalWire client using the project ID, auth token, and space URL. 

```PHP
<?php

require './vendor/autoload.php';
use SignalWire\Rest\Client;
$client = new Client('ProjectID', 'Auth Token', array("signalwireSpaceUrl" => "YOURSPACE.signalwire.com"));

 ```
 
 ## Next, we need to choose what parameters we'd like to filter by.
In this example, I have included how to filter by a date range, message status, from number, and to number.

```PHP
$messages = $client->messages->read([
    "dateSentAfter" => "2021-04-01",
    "dateSentBefore" => "2021-04-20",
    //'Status' => 'busy', // filter by Status
    //'From' => '+1xxxxxxxxxx', // filter by From
    //'To' => '+1xxxxxxxxxx', // filter by To
]);
```

## In the next section, we need to create the file to insert the message data into. 
Begin by writing headers and storing them in a variable called `$fields`. We also use `implode` to join the elements of the array with a string. We will then use `fopen` to create and open a file named __TodaysDate_MessageReport__. After that, we use `fputcsv` to insert our headers stored in `$fields` into our file. 

```PHP
$fields = array('Message SID', 'From', 'To', 'Date Sent', 'Status', 'Direction', 'Price');
echo '"'.implode('","', $fields).'"'."\n";

$fp = fopen(date("Y-m-d").'_messageReport.csv', 'w');

fputcsv($fp, $fields);
```

## Next, we need to loop through our `$messages` array in order to gather the necessary message data and insert it into our CSV. 
It is important to make sure the order of the headers is the same as the order of the values we will be gathering. As we loop through each message record, we will insert it into the CSV one by one and use implode to join the elements of the array with a string. The last step is to close the file! 

```PHP
foreach ($messages as $message) {
    $row = array(
        $message->sid, 
        $message->from, 
        $message->to, 
        $message->dateSent->format('Y-m-d H:i:s'), 
        $message->status, 
        $message->direction, 
        $message->price,
    );
    
    fputcsv($fp, $row);
    echo '"'.implode('","', $row).'"'."\n";
}

fclose($fp);
```
# List Messages to CSV in Ruby


## For the following code to work, you will need to have Active Support, CSV, and the SignalWire Ruby SDK installed. 


Read about the SignalWire Ruby SDK and how to install here: [https://docs.signalwire.com/topics/laml-api/#laml-rest-api-client-libraries-and-sdks-ruby]()

Read about Active Support and how to install here: [https://rubygems.org/gems/activesupport/versions/5.0.0.1]()

Read about CSV and how to install here: [https://rubygems.org/gems/csv/versions/0.0.1]()


## First, we need to import the necessary resources. 
In this case, we need to import `signalwire/sdk`, `active_support/time`, and `csv`.  

We also need to instantiate the SignalWire client using the project ID, auth token, and space URL. 

```Ruby
require 'signalwire/sdk'
require 'active_support/time'
require 'csv'

@client = Signalwire::REST::Client.new 'ProjectID', 'Auth Token', signalwire_space_url: 'YOURSPACE.signalwire.com'
```
## Next, we need to choose what parameters we'd like to filter by.
In this example, I have included how to filter by a date range and specify the page size of results you want to see returned. 

```Ruby
messages = @client.messages.list(page_size: 100, date_sent_after: Date.new(2021, 5, 1, 0, 0, 0))
```

## Next, we need to create headers for our CSV and insert the headers/message records into the CSV. 
It's important to make sure that the headers are in the exact same order as the messagerecord parameters. 
In the code section below, we create an array of headers. Next, we open a file __AccountMessages.csv__. We insert the headers before we begin the loop, otherwise the headers will precede every single record. After the headers have been inserted, we loop through each of the message records in `messages` and insert them one by one with all the listed parameters into the CSV. 

```Ruby
headers = ['MessageSID','Date Sent','Direction', 'From', 'To', 'Price', 'Status']
messages.each do |record|
     
        CSV.open('AccountMessages.csv', 'w+') do |csv|
               
                csv << headers
                
                messages.each do |record|
                csv << [record.sid, record.date_sent, record.direction, record.from,record.to, record.price, record.status]
        end
end
end
```


# List Messages to CSV in NodeJS


## For the following code to work, you will need to have the SignalWire NodeJS SDK installed. 


Read about the SignalWire NodeJS SDK and how to install here: [https://docs.signalwire.com/topics/laml-api/#laml-rest-api-client-libraries-and-sdks-nodejs]()


## First, we need to import the necessary resources. 
In this case, we need to import `@signalwire/node` amd `fs`.

We also need to instantiate the SignalWire client using the project ID, auth token, and space URL. 

```Javascript
import { RestClient } from "@signalwire/node";
import fs from "fs";

const client = new RestClient(
  "ProjectID",
  "Auth Token",
  { signalwireSpaceUrl: "YOURSPACE.signalwire.com" }
);
```

## Next we need to create our CSV file, an empty array to put our records into, and an array of headers. 
It's important to make sure that later when we loop through the message records, we push the parameters into the CSV in the same order as the headers here. Lastly, we push the headers into the CSV as the first row. 

```Javascript
let writeStream = fs.createWriteStream("CompanyNameMessages.csv");
let newLine = [];

const header = [
 "Message Sid",
 "To",
 "From",
 "Date Sent",
 "Status",
 "Direction",
 "Price",
];

newLine.push(header);
```

## Next, we determine which parameters we'd like to filter by and what parameters we expect to be pushed into the CSV. 
This filters used in this example are status and start time. When using date time objects in Javascript, it's important to remember that it starts at 0 with 0 being January. Then as we loop thorugh `messages`, we push each parameter into the CSV one by one. After we are finished looping through `messages` We use `writeStream.write` to separate these values by commas and add a new line at the end. Lastly, we use `writeStream.end` to close the file. 

```Javascript
client.messages
 .list({
   status: "delivered",
   dateSentAfter: new Date(Date.UTC(2021, 4, 1, 0, 0, 0)),
 })
 .then((messages) => {
   messages.forEach((c) => {
     newLine.push(
       c.sid,
       c.to,
       c.from,
       c.dateSent,
       c.status,
       c.direction,
       c.price
     );
   });
   writeStream.write(newLine.join(",") + "\n", () => {});
   writeStream.end();
 });
```

# Conclusion 
Record keeping is important, so we hope these examples help make it easier to filter your messages and export them to an external CSV with ease. All of these examples will accomplish the same goal and can be built upon to expand or further drill down the amount of data returned. Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!


# Sign Up Here

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.
