<?php

require './vendor/autoload.php';
use SignalWire\Rest\Client;
$client = new Client('ProjectID', 'AuthToken', array("signalwireSpaceUrl" => "YOURSPACE.signalwire.com"));


// filters by whatever parameters you need, simply uncomment to enable more or comment to enable less
$calls = $client->calls->read([
    //"startTimeAfter" => "2021-01-01",
    //"startTimeBefore" => "2021-02-01",
    //'Status' => 'busy', // filter by Status
    //'From' => '+1xxxxxxxxxx', // filter by From
    //'To' => '+1xxxxxxxxxx', // filter by To
]);


// Write Headers
$fields = array('Call SID', 'From', 'To', 'Start Time', 'End Time', 'Status', 'Direction', 'Price');
echo '"'.implode('","', $fields).'"'."\n";


// Open File named TodaysDate_CallReport
$fp = fopen(date("Y-m-d").'_CallReport.csv', 'w');

// Insert headers
fputcsv($fp, $fields);

// Write rows
foreach ($calls as $call) {
    $row = array(
        $call->sid, $call->from, $call->to, $call->startTime->format('Y-m-d H:i:s'), $call->endTime->format('Y-m-d H:i:s'),
        $call->status, $call->direction, $call->price,
    );
    // Insert rows into CSV
    fputcsv($fp, $row);

    echo '"'.implode('","', $row).'"'."\n";
}

// close file
fclose($fp);
