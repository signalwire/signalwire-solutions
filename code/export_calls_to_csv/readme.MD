# List Calls to CSV with All SignalWire SDKs

These snippets show how you can use SignalWire's API to filter the calls in your project by a number of parameters and then insert the call data into a CSV for your own record keeping. Walkthroughs will be provided in further detail below as the steps and methods vary with each language. 


You can read more about how this is done in our API documentation here:


[https://docs.signalwire.com/topics/laml-api/#api-reference-calls-list-all-calls]()


The possible parameters that you fan filter by are `EndTime`, `StartTime`, `Status`, `To`, `From`, and `ParentCallSid`. 


# List Calls to CSV in Python 


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
In this example, I have included how to filter by a date range and by the status of the call. Start Time is a datetime object where the order for the arguments is Year, Month, Date, Hour, Minute, Seconds. You can leave hour, minute, and seconds at 0, unless you have a specific time of day you would like to filter by. 

For months Jan - September, A slight change was made because python version (3.9) does not support leading 0's in datetime anymore. You must use the 0o prefix for octal literals now. That is reflected below in the code. If your version doesn’t include that limitation, you can switch it back to 01 or whatever month you need. 

You can filter by the possible statuses of `queued`, `ringing`, `in-progress`, `canceled`, `completed`, `busy`, `failed`.

```python

calls = client.calls.list(start_time_after=datetime(2021, 0o1, 24, 0, 0, 0), start_time_before=datetime(2021, 0o1, 27, 0, 0, 0), status='completed')

```

## We now need to insert the data from calls into an array. 
Here we set up an empty array. This will contain all of the data that we will gather from the calls. We can loop through calls and append each of the following parameters to our empty array: `form_formatted`, `to_formatted`, `start_time`, `status`, and `sid`. 

You can expand this to include as many or as few parameters as you'd like. To see all of the parameters returned in the JSON response, you can view our API documentation here: [https://docs.signalwire.com/topics/laml-api/?python#api-reference-calls-list-all-calls]()

After that, we print the array so that we can see what we have inserted for debugging purposes. 

```python
d = []

# Appends all data from calls into an array
for record in calls:
    d.append((record.from_formatted, record.to_formatted, record.start_time, record.status, record.sid))

print(d)

```
## Next we create a dataframe and export it to CSV. 
The next section of this code is to create a dataframe using pandas with column name headers. It's important to make sure that the order of the headers matches the order of the parameters you inserted into the array above. If you choose to add more or remove parameters, make sure to double check that the order matches or your data will be mismatched in the CSV. 

We then print the dataframe for debugging purposes and export the dataframe to csv. Using the parameter index=False turns off the indexing for each row. You can rename calls.csv to be as specific or general as you'd like. 


```python

df = pd.DataFrame(d, columns=('From', 'To', 'Date', 'Status', 'CallSID'))

print('dataframe')
print('\n')
print(df)

df.to_csv('calls.csv', index=False, encoding='utf-8')
```



# List Calls to CSV in PHP


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
In this example, I have included how to filter by a date range, call status, from number, and to number.

```PHP
$calls = $client->calls->read([
    "startTimeAfter" => "2021-01-01",
    "startTimeBefore" => "2021-02-01",
    'Status' => 'busy', 
    'From' => '+1xxxxxxxxxx', 
    'To' => '+1xxxxxxxxxx', 
]);
```

## In the next section, we need to create the file to insert the call data into. 
Begin by writing headers and storing them in a variable called `$fields`. We also use `implode` to join the elements of the array with a string. We will then use `fopen` to create and open a file named __TodaysDate_CallReport__. After that, we use `fputcsv` to insert our headers stored in `$fields` into our file. __TodaysDate_CallReport__.

```PHP
$fields = array('Call SID', 'From', 'To', 'Start Time', 'End Time', 'Status', 'Direction', 'Price');
echo '"'.implode('","', $fields).'"'."\n";

$fp = fopen(date("Y-m-d").'_CallReport.csv', 'w');

fputcsv($fp, $fields);
```

## Next, we need to loop through our `$calls` array in order to gather the necessary call data and insert it into our CSV. 
It is important to make sure the order of the headers is the same as the order of the values we will be gathering. As we loop through each call record, we will insert it into the CSV one by one and use implode to join the elements of the array with a string. The last step is to close the file! 

```PHP
foreach ($calls as $call) {
    $row = array(
        $call->sid, $call->from, $call->to, $call->startTime->format('Y-m-d H:i:s'), $call->endTime->format('Y-m-d H:i:s'),
        $call->status, $call->direction, $call->price,
    );
  
    fputcsv($fp, $row);

    echo '"'.implode('","', $row).'"'."\n";
}
fclose($fp);
```
# List Calls to CSV in Ruby


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
In this example, I have included how to filter by a date range of the last 7 days and a status of completed. 

```Ruby
calls = @client.calls.list(status: 'completed', end_time_after: (DateTime.now - 7.days).strftime('%a, %d %b %Y %H:%M:%S GMT'))
```

## Next, we need to create headers for our CSV and insert the headers/call records into the CSV. 
It's important to make sure that the headers are in the exact same order as the call record parameters. 
In the code section below, we create an array of headers. Next, we open a file __AccountCalls.csv__. We insert the headers before we begin the loop, otherwise the headers will precede every single record. After the headers have been inserted, we loop through each of the call records in `calls` and insert them one by one with all the listed parameters into the CSV. 

```Ruby
headers = ['CallSID','Date Created','Direction', 'Duration', 'End Time', 'From', 'To', 'Price']

calls.each do |record|
        CSV.open('AccountCalls.csv', 'w+') do |csv|
                csv << headers
                calls.each do |record|
                csv << [record.sid, record.date_created, record.direction, record.duration, record.end_time, record.from,record.to, record.price]
        end
end
end 
```


# List Calls to CSV in NodeJS


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
It's important to make sure that later when we loop through the call record, we push the parameters into the CSV in the same order as the headers here. Lastly, we push the headers into the CSV as the first row. 

```Javascript
let writeStream = fs.createWriteStream("CompanyNameCalls.csv");
let newLine = [];

const header = [
  "Call Sid",
  "To",
  "From",
  "Start Time",
  "End Time",
  "Status",
  "Direction",
  "Duration",
  "Price",
];

newLine.push(header);
```

## Next, we determine which parameters we'd like to filter by and what parameters we expect to be pushed into the CSV. 
This filters used in this example are status and start time. When using date time objects in Javascript, it's important to remember that it starts at 0 with 0 being January. Then as we loop thorugh `calls`, we push each parameter into the CSV one by one. After we are finished looping through `calls` We use `writeStream.write` to separate these values by commas and add a new line at the end. Lastly, we use `writeStream.end` to close the file. 

```Javascript
client.calls
  .list({
    status: "completed",
    startTimeAfter: new Date(Date.UTC(2021, 2, 28, 0, 0, 0)),
  })
  .then((calls) => {
    calls.forEach((c) => {
      newLine.push(
        c.sid,
        c.to,
        c.from,
        c.startTime,
        c.endTime,
        c.status,
        c.direction,
        c.duration,
        c.price
      );
    });
    writeStream.write(newLine.join(",") + "\n", () => {});
    writeStream.end();
  });
```

# Conclusion 
Record keeping is important, so we hope these examples help make it easier to filter your calls and export them to an external CSV with ease. All of these examples will accomplish the same goal and can be built upon to expand or further drill down the amount of data returned. Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!


# Sign Up Here
__Include the following section at the bottom so our potential customers who may not already have a space have instructions on how to proceed.__

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.
